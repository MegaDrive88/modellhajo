import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import CompetitionEntry from '../../interfaces/competition.entry.interface';
import { forkJoin } from 'rxjs';
import Competition from '../../interfaces/competition.interface';
import Category from '../../interfaces/category.interface';

@Component({
  selector: 'myEntries-root',
  imports: [MenuBarComponent],
  templateUrl: './myEntries.html',
  styleUrls: [
    '../../app.scss',
    './myEntries.scss'
  ]})
export class MyEntriesComponent implements OnInit{
  protected ds = inject(DataService)
  protected myEntries!: {
    [versenyid: string] : CompetitionEntry[]
  }
  protected keys!: string[]
  protected competitions!:Competition[]
  protected categories!:Category[]
  protected today = new Date().toISOString()

  ngOnInit(): void {
    // nevezések -> versenyid alapjan versenyek, csoportositva felhasznalo id alapjan
    const userId = this.ds.getUser()?.id!;
    this.ds.loader.loadingOn()
    forkJoin({
      competitions: this.ds.getAllCompetitions(),
      entries: this.ds.getEntriesByUserId(userId),
      categories: this.ds.getAssociationsAndCategories()
    }).subscribe(({ competitions, entries, categories }) => {
      this.myEntries = entries.entries;
      this.keys = Object.keys(entries.entries);
      this.competitions = competitions.data
      this.categories = categories.categories
      this.ds.loader.loadingOff()
    });
  }
  getCompById(key:string){
    return this.competitions.find(x=>x.id.toString() == key)
  }
  getCategoryName(id:number){
    return this.categories.find(x=>x.id == id)?.nev
  }
  cancelEntry(id: number){
    this.ds.cancelEntry(id).subscribe({
      next:()=>{
        alert("Nevezését sikeresen lemondta az adott kategóriában.")
        location.reload()
      }
    })
  }
}
