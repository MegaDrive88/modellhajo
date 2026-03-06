import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import { forkJoin } from 'rxjs';
import CompetitionEntry from '../../interfaces/competition.entry.interface';
import Competition from '../../interfaces/competition.interface';
import Category from '../../interfaces/category.interface';
import User from '../../interfaces/user.interface';

@Component({
  selector: 'entries-root',
  imports: [MenuBarComponent],
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
  ngOnInit(): void {
    this.ds.loader.loadingOn()
    forkJoin({
      competitions: this.ds.getUserCompetitions(),
      entries: this.ds.getEntriesByOrganizerId(),
      categories: this.ds.getAssociationsAndCategories(),
      competitors: this.ds.getCompetitors()
    }).subscribe(({ competitions, entries, categories, competitors }) => {      
      this.entries = entries.entries
      this.competitions = competitions.data
      this.categories = categories.categories
      this.competitors = competitors.competitors      
      this.ds.loader.loadingOff()
    });
  }
  getCategoryName(id:number){
    return this.categories.find(x=>x.id == id)?.nev
  }
  getCompetitorName(id:number){
    return this.competitors.find(x=>x.id == id)?.megjeleno_nev
  }
  exportCSVCommand(versenyid: number){
    const topRow = "Versenyzo neve;Versenyzo MMSZ azonositoja;Versenyzo e-mail cime;Kategoria\n"
    let rows: string[] = []
    for(const entry of this.entries[versenyid.toString()]){
      rows.push(`${this.getCompetitorName(entry.versenyzoid)};${this.competitors.find(x=>x.id == entry.versenyzoid)?.mmsz_id};${this.competitors.find(x=>x.id == entry.versenyzoid)?.email};${this.getCategoryName(entry.kategoriaid)}`)
    }
    this.downloadFile(`${topRow}${rows.join('\n')}`, `${versenyid}_${this.competitions.find(x=>x.id == versenyid)?.nev.replaceAll(" ", "_")}.csv`, "text/plain")
  }
  private downloadFile(content: string, name: string, type: string){
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}



//   // Export button command
//   exportCSVCommand(){
//     const topRow: string = Object.keys(this.courses[0]).slice(0, -2).join(";") + "\n"
//     let rows: string[] = []
//     for (const course of this.courses) {
//       rows.push(`${course.startDate};${course.endDate};${course.language};${course.category};${course.courseName};${course.courseNameEnglish};${course.difficulty};${course.instructor};${course.price}`)
//     }
//     this.downloadFile(`${topRow}${rows.join('\n')}`, "courses.csv", "text/plain")
//   }