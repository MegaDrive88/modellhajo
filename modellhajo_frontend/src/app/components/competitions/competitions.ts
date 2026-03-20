import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { FormsModule } from '@angular/forms';
import Competition from '../../interfaces/competition.interface';
import { CommonModule } from '@angular/common';
import Association from '../../interfaces/association.interface';
import Category from '../../interfaces/category.interface';
import { NgSelectModule } from '@ng-select/ng-select';
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet'
import 'leaflet-draw';
import 'leaflet-control-geocoder';


@Component({
  selector: 'competitions-root',
  imports: [MenuBarComponent, FormsModule, CommonModule, NgSelectModule],
  templateUrl: './competitions.html',
  styleUrls: [
    '../../app.scss',
    './competitions.scss'
  ]})
export class CompetitionsComponent implements OnInit, AfterViewInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected associations!: Association[]
  protected categories!: Category[]
  protected newCompetitionCategories: number[] = []
  protected userCompetitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  protected formEditable = false
  private editMode = -1
  @ViewChild("map") map!:ElementRef
  @ViewChild('competitionThumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>
  
  ngAfterViewInit(): void {
      const map = L.map(this.map.nativeElement, {
      maxZoom: 20,
      minZoom: 10,
      center: [47.68, 17.63],
      zoom: 15
    });

    // ADD LAYERS
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    })
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, USDA, USGS, and the GIS User Community'
    })
    streetLayer.addTo(map);
    const baseMaps = {
      "Street": streetLayer,
      "Satellite": satelliteLayer,
    };
    L.control.layers(baseMaps,).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        // remove: false
      },
      draw: {
        polygon: false,
        polyline: false,
        circle: false,
        rectangle: false,
        marker: {},
        circlemarker: false
      }
    });
    map.addControl(drawControl);
    map.on('draw:created', (event: L.LeafletEvent) => { // csak egyet!
      const layer = event.layer;
      drawnItems.addLayer(layer);
    });



    const geocoder = (L.Control as any).Geocoder.nominatim({
      geocodingQueryParams: {
        countrycodes: 'hu', // only search Hungary
        limit: 10
      }});
    const control = (L.Control as any).geocoder({
      defaultMarkGeocode: false,
      geocoder: geocoder
    }).on('markgeocode', (e: any) => {
    const center = e.geocode.center; 
      map.setView([center.lat, center.lng], 12);
    }).addTo(map);
  }

  private today(){
    const raw = new Date().toISOString().split(":")
    raw.pop()
    return raw.join(":")
  }
  protected newComp: Omit<Competition, "id" | "letrehozo_id"> = {
      kezdet: this.today(),
      veg: this.today(),
      nev: '',
      evszam: '',
      helyszin: '',
      megjelenik: this.today(),
      nevezesi_hatarido: this.today(),
      gps_lat: null,
      gps_lon: null,
      szervezo_egyesulet: -1,
      leiras: null,
      nevezesi_dij_junior: null,
      nevezesi_dij_normal: null,
      kep_url: null,
      kep_fajlnev: null,
      categories:[]
  }
  ngOnInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '../marker-icon-2x.png',
      iconUrl: '../marker-icon.png',
      shadowUrl: '../marker-shadow.png'
    });
    this.ds.loader.loadingOn()
    // Use forkJoin to guarantee both calls complete before processing
    forkJoin({
      assocAndCats: this.ds.getAssociationsAndCategories(),
      compCats: this.ds.getCompetitionCategories(),
      userComps: this.ds.getUserCompetitions()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ assocAndCats, compCats, userComps }) => {
        this.associations = assocAndCats.associations
        this.categories = assocAndCats.categories
        this.competitionCategories = compCats.categories
        this.userCompetitions = userComps.data
        for (const comp of this.userCompetitions) {
          comp.categories = this.competitionCategories.filter(x => x.versenyid == comp.id).map(x => x.category)
        }
        this.ds.loader.loadingOff()
      },
      error: (err) => {
        console.error('Failed to load competition data', err)
        alert('Hiba történt az adatok betöltésekor.')
        this.ds.loader.loadingOff()
      }
    })
  }
  async sendCompetitionData(){
      this.ds.loader.loadingOn()
      const fileInput = this.thumbnailInput.nativeElement
      if (fileInput.files && fileInput.files[0]){
          const file = fileInput.files[0]
          const formdata = new FormData()
          formdata.append("thumbnail", file)
          const data = await this.ds.uploadCompetitionThumbnail(formdata)
          this.newComp.kep_fajlnev = file.name
          this.newComp.kep_url = data.url
      }
      if(this.editMode != -1){
        this.ds.deleteCompetition(this.editMode).pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
      }
      this.ds.createCompetition(this.newComp).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => {
          if (data.success) {
            this.ds.createCompetitionCategories({ compId: data.compId, categs: this.newCompetitionCategories })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: result => {
                  if (result.success) {
                    if(this.editMode == -1) alert("Sikeres verseny létrehozás")
                    else alert("Sikeres módosítás")
                    this.ds.loader.loadingOff()
                    this.ds.router.navigateByUrl('/competitions', { replaceUrl: true })
                      .then(() => this.ngOnInit())
                    this.formEditable = false
                  }
                },
                error: err => {
                  console.error(err)
                  this.ds.loader.loadingOff()
                }
              })
          }
        },
        error: err => {
          console.error(err)
          this.ds.loader.loadingOff()
        }
      })
   
  }
  FormEnabled(){
        return (
            this.newComp.nev != "" &&
            this.newComp.helyszin != "" &&
            this.newComp.szervezo_egyesulet != -1 &&
            this.newComp.nevezesi_dij_junior != null && this.newComp.nevezesi_dij_junior > 0 &&
            this.newComp.nevezesi_dij_normal != null && this.newComp.nevezesi_dij_normal > 0 &&
            (this.newComp.evszam?.length == 4 || this.newComp.evszam?.length == 0) &&
            this.newCompetitionCategories.length > 0 &&
            this.newComp.kezdet <= this.newComp.veg && 
            this.newComp.nevezesi_hatarido <= this.newComp.kezdet
        )
  }
  deleteCompetition(id: number){
    if (confirm("Biztosan törölni szeretné?")) {
        this.ds.deleteCompetition(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: data => {
            if (data.success) {
              this.userCompetitions = this.userCompetitions.filter(c => c.id !== id)
            }
          },
          error: err => console.error(err)
        })
    }
  }
  editCompetition(id: number){
    this.editMode = id
    let comp = this.userCompetitions.find(x => x.id == id)!
    this.newComp = structuredClone(comp)
    this.newComp.kezdet = new Date(comp.kezdet).toISOString().slice(0, 16)
    this.newComp.veg = new Date(comp.veg).toISOString().slice(0, 16)
    this.newComp.nevezesi_hatarido = new Date(comp.nevezesi_hatarido).toISOString().slice(0, 16)
    this.newComp.megjelenik = new Date(comp.megjelenik).toISOString().slice(0, 16)
    this.newCompetitionCategories = this.newComp.categories.map(x=>x.id)
    this.formEditable = true
  }
  newCompCommand(){
    this.editMode = -1
    this.newComp = {
      kezdet: this.today(),
      veg: this.today(),
      nev: '',
      evszam: '',
      helyszin: '',
      megjelenik: this.today(),
      nevezesi_hatarido: this.today(),
      gps_lat: null,
      gps_lon: null,
      szervezo_egyesulet: -1,
      leiras: null,
      nevezesi_dij_junior: null,
      nevezesi_dij_normal: null,
      kep_url: null,
      kep_fajlnev: null,
      categories:[]
    }
    this.newCompetitionCategories = []
    this.formEditable = true
  }
}
