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
import Swal from 'sweetalert2';

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
  private markerPlaced = false
  private drawnItems!:L.FeatureGroup
  @ViewChild("map") map!:ElementRef
  private leafletMap!:L.DrawMap
  @ViewChild('competitionThumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>
  
  ngAfterViewInit(): void {
      this.leafletMap = L.map(this.map.nativeElement, {
      maxZoom: 18,
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
    streetLayer.addTo(this.leafletMap);
    const baseMaps = {
      "Street": streetLayer,
      "Satellite": satelliteLayer,
    };
    L.control.layers(baseMaps,).addTo(this.leafletMap);

    this.drawnItems = new L.FeatureGroup();
    this.leafletMap.addLayer(this.drawnItems);
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
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
    this.leafletMap.addControl(drawControl);
    this.leafletMap.on('draw:created', (event: L.LeafletEvent) => {
      if (this.markerPlaced) return
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      this.newComp.gps_lat = (layer as any)._latlng.lat
      this.newComp.gps_lon = (layer as any)._latlng.lng
      this.markerPlaced = true
    });

    this.leafletMap.on('draw:edited', (event: any) => {      
      event.layers.eachLayer((l: any)=>{        
        this.newComp.gps_lat = l._latlng.lat
        this.newComp.gps_lon = l._latlng.lng
      })
    });

    this.leafletMap.on('draw:deleted', (event: any) => {
      event.layers.eachLayer((l: any)=>{
        this.newComp.gps_lat = null
        this.newComp.gps_lon = null
        this.markerPlaced = false
      })
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
      this.leafletMap.setView([center.lat, center.lng], 12);
    }).addTo(this.leafletMap);
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
        iconRetinaUrl: new URL('assets/marker-icon-2x.png', document.baseURI).href,
        iconUrl: new URL('assets/marker-icon.png', document.baseURI).href,
        shadowUrl: new URL('assets/marker-shadow.png', document.baseURI).href
    });
    // Use forkJoin to guarantee both calls complete before processing
    forkJoin({
      assocAndCats: this.ds.getAssociationsAndCategories(),
      compCats: this.ds.getCompetitionCategories(),
      userComps: this.ds.getUserCompetitions()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ assocAndCats, compCats, userComps }) => {
        this.associations = assocAndCats.associations
        this.categories = assocAndCats.categories.sort((a, b) => a.nev.localeCompare(b.nev))
        this.competitionCategories = compCats.categories
        this.userCompetitions = userComps.data
        for (const comp of this.userCompetitions) {
          comp.categories = this.competitionCategories.filter(x => x.versenyid == comp.id).map(x => x.category)
        }
      },
      error: (err) => {
        console.error('Failed to load competition data', err)
        Swal.fire({title: 'Hiba történt az adatok betöltésekor.', theme: 'material-ui-dark'})
      }
    })
  }
  async sendCompetitionData(){
      const fileInput = this.thumbnailInput.nativeElement
      if (fileInput.files && fileInput.files[0]){
          const file = fileInput.files[0]
          const formdata = new FormData()
          formdata.append("thumbnail", file)
          const data = await this.ds.uploadCompetitionThumbnail(formdata)
          this.newComp.kep_fajlnev = file.name
          this.newComp.kep_url = data.url
      }
      if (this.editMode !== -1) {
        this.ds.updateCompetition(this.editMode, {
          ...this.newComp,
          categs: this.newCompetitionCategories,
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: result => {
            if (result.success) {
              Swal.fire({title: "Sikeres módosítás", theme: "material-ui-dark"})
              this.ds.router.navigateByUrl('/competitions', { replaceUrl: true })
                .then(() => this.ngOnInit())
              this.formEditable = false
            }
          },
          error: err => {
            console.error(err)
          }
        })
        return
      }

      this.ds.createCompetition(this.newComp).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => {
          if (data.success) {
            this.ds.createCompetitionCategories({ compId: data.compId, categs: this.newCompetitionCategories })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: result => {
                  if (result.success) {
                    Swal.fire({title: "Sikeres verseny létrehozás", theme: "material-ui-dark"})
                    this.ds.router.navigateByUrl('/competitions', { replaceUrl: true })
                      .then(() => this.ngOnInit())
                    this.formEditable = false
                  }
                },
                error: err => {
                  console.error(err)
                }
              })
          }
        },
        error: err => {
          console.error(err)
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
    if (confirm("Biztosan törölni szeretné?")) { // swal
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
    this.leafletMap.eachLayer((l:any)=>{
      if (l instanceof L.Marker) {
        this.leafletMap.removeLayer(l);
      }
      
    })
    if (this.newComp.gps_lat !== null && this.newComp.gps_lon !== null){
      this.drawnItems.addLayer(L.marker({lat: this.newComp.gps_lat, lng: this.newComp.gps_lon}, { draggable: false }))
      this.leafletMap.setView([this.newComp.gps_lat, this.newComp.gps_lon]);
      this.markerPlaced = true
    }
    this.formEditable = true
  }
  newCompCommand(){
    this.editMode = -1
    this.leafletMap.eachLayer((l:any)=>{
      if (l instanceof L.Marker) {
        this.leafletMap.removeLayer(l);
      }
      
    })
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
  selectAllCategories(){
    
  }
}
