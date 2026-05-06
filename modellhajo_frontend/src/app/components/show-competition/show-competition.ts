import { CommonModule, DatePipe } from "@angular/common";
import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../../services/data.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import Competition from "../../interfaces/competition.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TopBarComponent } from "../top-bar/top-bar";
import * as L from 'leaflet'
import 'leaflet-control-geocoder';
import { forkJoin, Subject } from "rxjs";
import CompetitionEntry from "../../interfaces/competition.entry.interface";
import User from "../../interfaces/user.interface";
import Category from "../../interfaces/category.interface";

@Component({
  selector: 'show-competitions-root',
  imports: [CommonModule, TopBarComponent, DatePipe, RouterLink],
  templateUrl: './show-competition.html',
  styleUrls: [
    '../../app.scss',
    './show-competition.scss'
  ]})
export class ShowCompetitonComponent implements OnInit, AfterViewInit {
    protected competition:Competition|undefined
    protected entriesByCompetition: CompetitionEntry[] = []
    protected categories!:Category[]
    protected competitors!:User[]
    protected ds = inject(DataService)
    private route = inject(ActivatedRoute)
    private destroyRef = inject(DestroyRef)
    protected today = new Date()
    @ViewChild("map",{ static: false }) map!:ElementRef<HTMLDivElement>
    private leafletMap!:L.Map
    private compLoaded$ = new Subject<Competition>
    ngOnInit(): void {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: new URL('assets/marker-icon-2x.png', document.baseURI).href,
            iconUrl: new URL('assets/marker-icon.png', document.baseURI).href,
            shadowUrl: new URL('assets/marker-shadow.png', document.baseURI).href
        });
        const competitionId = Number(this.route.snapshot.paramMap.get('id')!)
        if(this.ds.getUser()){
            forkJoin({
                competition: this.ds.getCompetitionById(competitionId),
                entries: this.ds.getEntriesByCompetitionId(competitionId),
                assocsAndCats: this.ds.getAssociationsAndCategories(),
                competitors: this.ds.getCompetitors()
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next:({ competition, entries, assocsAndCats, competitors })=>{
                    if (competition.success) {
                        this.competition = competition.data
                        this.competition.kezdet = new Date(this.competition.kezdet)
                        this.competition.veg = new Date(this.competition.veg)
                        this.competition.megjelenik = new Date(this.competition.megjelenik)
                        this.competition.nevezesi_hatarido = new Date(this.competition.nevezesi_hatarido)
                        this.compLoaded$.next(competition.data)
                    }
                    this.entriesByCompetition = Object.values(entries.entries ?? {}).flat()
                    this.categories = assocsAndCats.categories
                    this.competitors = competitors.competitors
                },
                error: (err)=>{console.log(err)}
            })  
        }
        else{
            this.ds.getCompetitionById(competitionId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (data)=>{
                    if (data.success) {
                        this.competition = data.data
                        this.compLoaded$.next(data.data)
                    }
                },
                error: (err)=>{console.log(err)}
            })
        }
    }
    ngAfterViewInit(): void {
        this.compLoaded$.subscribe((competition)=>{            
            this.leafletMap = L.map(this.map.nativeElement, {
                maxZoom: 18,
                minZoom: 10,
                center: [competition.gps_lat ?? 47.68, competition.gps_lon ?? 17.63],
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
            if (competition.gps_lat !== null && competition.gps_lon !== null)
                L.marker({lat: competition.gps_lat, lng: competition.gps_lon}, { draggable: false }).addTo(this.leafletMap)        })            
    }
    getCategoryName(id:number){
        return this.categories.find(x=>x.id == id)?.nev
    }
    getCompetitorName(id:number){
        return this.competitors.find(x=>x.id == id)?.megjeleno_nev
    }
    entrySort(arr: CompetitionEntry[]){
        arr.sort((a, b) => {
            const categoryA = this.categories.find(x=>x.id == a.kategoriaid)!.nev;
            const categoryB = this.categories.find(x=>x.id == b.kategoriaid)!.nev;
            
            if (categoryA > categoryB) return 1;
            if (categoryA < categoryB) return -1;
    
            const nameA = this.competitors.find(x=> x.id == a.versenyzoid)!.megjeleno_nev;
            const nameB = this.competitors.find(x=> x.id == b.versenyzoid)!.megjeleno_nev;
    
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
    
            return 0;
        }); 
        return arr
    }
}
/*TODO 
- tobb rendezo egy versenyhez
- tamogatohoz versenyzot kapcsolni
- rendezo dashboard: kovetkezo esemen
- versenyzo dashboard: kovetkezo verseny, ranglista
- telepites naplo

- lezajlott versenynel eredmenyek az "egy verseny" oldalon

- elfogadasrol email
- docker compose és schedule work
- valami jobb hibauzenet ha az uj jelszavak nem egyeznek elfelejtettnél
- tovabbi backend rework
- email, ha valaki regisztral/nevez
- mmszid csak opcionalis
-  futam-> eredmeny -> vegeredmeny
*/