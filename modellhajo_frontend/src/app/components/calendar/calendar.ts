import { Component } from '@angular/core';
import { App } from '../../app';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar";
import Association from '../../interfaces/association.interface';
import Category from '../../interfaces/category.interface';
import CompetitionCategory from '../../interfaces/competition.category.interface';

@Component({
  selector: 'calendar-root',
  imports: [TopBarComponent],
  templateUrl: './calendar.html',
  styleUrls: [
    '../../app.scss',
    './calendar.scss'
  ]})
export class CalendarComponent extends App {
  protected competitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  override ngOnInit(): void {
    this.loader.loadingOn
    this.http.get<any>(`${this.API_URL}/getCompetitionCategories`).subscribe(
      data=>{
        if (data.success){
          this.competitionCategories = data.categories
        }
      },
      error=>console.log(error)
    )
    this.http.get<any>(`${this.API_URL}/getAllCompetitions`).subscribe(
      data=>{
        if(data.success) {
          this.competitions = data.data
          for (const comp of this.competitions) {
            comp.categories = this.competitionCategories.filter(x=>x.versenyid == comp.id).map(x=>x.category)
          }
        }
      },
      error => console.log(error)
      //backend refactor? controllerek? loader es api hivasok dataservice-be?
    )
      
  }
}
