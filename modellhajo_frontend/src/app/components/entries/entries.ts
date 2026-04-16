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
  protected entryNumbers: Record<number, number | string | null> = {}
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

      for (const competitionEntries of Object.values(this.entries)) {
        for (const entry of competitionEntries) {
          this.entryNumbers[entry.id] = entry.rajtszam
        }
      }
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

  private parseRajtszam(value: number | string | null | undefined): number | null | undefined {
    if (value === null || value === undefined || value === '') {
      return null
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return undefined
    }

    return parsed
  }
  deleteEntry(entry: CompetitionEntry){
    Swal.fire({
      title: "Biztosan törli ezt a nevezést?",
      text: `${this.getCompetitorName(entry.versenyzoid)} nevezése ${this.getCategoryName(entry.kategoriaid)} kategóriában törlődni fog.`,
      theme: "material-ui-dark",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Törlés",
      cancelButtonText: "Mégse"
    }).then((result) => {
      if (!result.isConfirmed) {
        return
      }

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
      error: (e) => {
        console.log(e.error);
        
        if(e.error.message.includes("Key (kategoriaid, versenyid, rajtszam)")){
          Swal.fire({
            title: "Ebben a kategóriában már szerepel ez a rajtszám",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
        else if(e.error.message.includes("Key (versenyzoid, kategoriaid, versenyid)")){
          Swal.fire({
            title: "A versenyző már nevezve van ebben a kategóriában!",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
        else{
          Swal.fire({
            title: "Hiba történt a nevezés során!",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
      }
    })
  }

  updateNumber(id: number){
    const rajtszam = this.parseRajtszam(this.entryNumbers[id])

    if (rajtszam === undefined) {
      Swal.fire({
        title: "A rajtszám csak pozitív egész szám lehet",
        theme: "material-ui-dark",
        icon: "error"
      })
      return
    }

    this.ds.updateEntryNumber(id, rajtszam).subscribe({
      next: async () => {
        await Swal.fire({
          title: "A rajtszám sikeresen mentve",
          theme: "material-ui-dark",
          icon: "success"
        })
        location.reload()
      },
      error: (e) => {        
        if(e.error.message.includes("unique")){
          Swal.fire({
            title: "Ebben a kategóriában már szerepel ez a rajtszám",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
        else{
          Swal.fire({
            title: "Hiba történt a rajtszám mentése során!",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
      }
    })
  }

  saveAllEntries(compId: number){
    const competitionEntries = this.getEntryArray(compId.toString())
    const payload = competitionEntries.map(entry => {
      const rajtszam = this.parseRajtszam(this.entryNumbers[entry.id])
      return { id: entry.id, rajtszam }
    })

    if (payload.some(item => item.rajtszam === undefined)) {
      Swal.fire({
        title: "A rajtszám csak pozitív egész szám lehet",
        theme: "material-ui-dark",
        icon: "error"
      })
      return
    }

    this.ds.bulkUpdateEntryNumbers(compId, payload as { id: number; rajtszam: number | null }[]).subscribe({
      next: async () => {
        await Swal.fire({
          title: "Az összes rajtszám sikeresen mentve",
          theme: "material-ui-dark",
          icon: "success"
        })
        location.reload()
      },
      error: () => {
        Swal.fire({
          title: "Hiba történt az összes rajtszám mentése során!",
          theme: "material-ui-dark",
          icon: "error"
        })
      }
    })
  }

  deleteAllEntries(compId: number){
    Swal.fire({
      title: "Biztosan törli az összes nevezést ebből a versenyből?",
      text: "Ez csak az adott verseny nevezéseit törli.",
      theme: "material-ui-dark",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Törlés",
      cancelButtonText: "Mégse"
    }).then((result) => {
      if (!result.isConfirmed) {
        return
      }

      this.ds.deleteAllEntries(compId).subscribe({
        next: async () => {
          await Swal.fire({
            title: "Az összes nevezés sikeresen törölve",
            theme: "material-ui-dark",
            icon: "success"
          })
          location.reload()
        },
        error: () => {
          Swal.fire({
            title: "Hiba történt az összes nevezés törlése során!",
            theme: "material-ui-dark",
            icon: "error"
          })
        }
      })
    })
  }

}