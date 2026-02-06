import { Component } from '@angular/core';
import { App } from '../../app';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar";
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'calendar-root',
  imports: [TopBarComponent, DatePipe],
  templateUrl: './calendar.html',
  styleUrls: [
    '../../app.scss',
    './calendar.scss'
  ]})
export class CalendarComponent {
  constructor(private statics:App){}
  protected competitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  protected today = new Date().toISOString()
  ngOnInit(): void {
    this.statics.loader.loadingOn()
    this.statics.http.get<any>(`${this.statics.API_URL}/getCompetitionCategories`).subscribe(
      data=>{
        if (data.success){
          this.competitionCategories = data.categories
        }
      },
      error=>console.log(error)
    )
    this.statics.http.get<any>(`${this.statics.API_URL}/getAllCompetitions`).subscribe(
      data=>{
        if(data.success) {
          this.competitions = data.data
          for (const comp of this.competitions) {
            comp.categories = this.competitionCategories.filter(x=>x.versenyid == comp.id).map(x=>x.category)
          }
        }
        this.statics.loader.loadingOff()
      },
      error => console.log(error)
      //backend refactor? controllerek? loader es api hivasok dataservice-be?
    )
      
  }
}
