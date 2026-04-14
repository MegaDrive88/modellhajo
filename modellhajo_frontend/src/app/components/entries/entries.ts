import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import CompetitionEntry from '../../interfaces/competition.entry.interface';
import Competition from '../../interfaces/competition.interface';
import Category from '../../interfaces/category.interface';
import User from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule } from "@angular/forms";
import Association from '../../interfaces/association.interface';

@Component({
  selector: 'entries-root',
  imports: [MenuBarComponent, CommonModule, NgSelectComponent, FormsModule],
  templateUrl: './entries.html',
  styleUrls: [
    '../../app.scss',
    './entries.scss'
  ]})
export class EntriesComponent implements OnInit {
  protected ds = inject(DataService)
  protected entries!: {
    [versenyid: string] : CompetitionEntry[]
  }
  protected competitions!:Competition[]
  protected categories!:Category[]
  protected competitors!:User[]
  protected associations!:Association[]

  protected newEntry = {competitor: null, category: null, assoc: null, number: null}
  ngOnInit(): void {
    forkJoin({
      competitions: this.ds.getUserCompetitions(),
      entries: this.ds.getEntriesByOrganizerId(),
      ca: this.ds.getAssociationsAndCategories(),
      competitors: this.ds.getCompetitors()
    }).subscribe(({ competitions, entries, ca, competitors }) => {      
      this.entries = entries.entries      
      this.competitions = competitions.data
      this.categories = ca.categories
      this.competitors = competitors.competitors     
      this.associations = ca.associations
    });
  }
  getCategoryName(id:number){
    return this.categories.find(x=>x.id == id)?.nev
  }
  getCompetitorName(id:number){
    return this.competitors.find(x=>x.id == id)?.megjeleno_nev
  }
  getAssociationName(id:number){
    return this.associations.find(x=>x.id == id)?.nev
  }
  getEntryArray(compid: string):CompetitionEntry[] {
    let _entries = this.entries[compid]
    if (!_entries) return []
    return this.entrySort(_entries)
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
  exportCSVCommand(versenyid: number){
    const topRow = "Kategória;Versenyző neve;Versenyző rajtzáma;Versenyző MMSZ azonosítója;Versenyző e-mail címe\n"
    let rows: string[] = []
    for(const entry of this.entrySort(this.entries[versenyid.toString()])){
      rows.push(`${this.getCategoryName(entry.kategoriaid)};${this.getCompetitorName(entry.versenyzoid)};${entry.rajtszam ?? '-'};${this.competitors.find(x=>x.id == entry.versenyzoid)?.mmsz_id};${this.competitors.find(x=>x.id == entry.versenyzoid)?.email}`)
    }
    this.downloadFile(`${topRow}${rows.join('\n')}`, `${versenyid}_${this.competitions.find(x=>x.id == versenyid)?.nev.replaceAll(" ", "_")}.csv`, "text/plain")
  }
  private downloadFile(content: string, name: string, type: string){
    const blob = new Blob([`\uFEFF${content}`], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  deleteEntry(entry: CompetitionEntry){
    this.ds.cancelEntry(entry.id).subscribe({
      next: async () => {
        await Swal.fire({
          title: `${this.getCompetitorName(entry.versenyzoid)} nevezése ${this.getCategoryName(entry.kategoriaid)} kategóriában sikeresen visszavonva`,
          theme: "material-ui-dark",
          icon: "success"
        })
        location.reload()
      },
      error: () => {
        Swal.fire({
          title: "Hiba történt a törlés során!",
          theme: "material-ui-dark",
          icon: "error"
        })
      }
    })
  }
  createEntry(compid: number){
    if(!this.newEntry.competitor || !this.newEntry.category){
      Swal.fire({
        title: "Töltse ki mindkét mezőt",
        theme: "material-ui-dark",
        icon: "error"
      })
      return
    }
    this.ds.manuallyEnterCompetitor(compid, this.newEntry).subscribe({
      next: async () => {
        await Swal.fire({
          title: `${this.getCompetitorName(this.newEntry.competitor!)} ${this.getCategoryName(this.newEntry.category!)} kategóriában sikeresen nevezve!`,
          theme: "material-ui-dark",
          icon: "success"
        })        
        location.reload()
      },
      error: () => {
        //ilyen nevezes mar van - kulon hibat dobni ra
        Swal.fire({
          title: "Hiba történt a nevezés során!",
          theme: "material-ui-dark",
          icon: "error"
        })
      }
    })
    
  }
  updateNumber(id: number){
    
  }
  deleteAllEntries(compId: number){

  }
}