import { Component, inject } from '@angular/core';
import Competition from '../../interfaces/competition.interface';
import { TopBarComponent } from "../top-bar";
import CompetitionCategory from '../../interfaces/competition.category.interface';
import { DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'calendar-root',
  imports: [TopBarComponent, DatePipe],
  templateUrl: './calendar.html',
  styleUrls: [
    '../../app.scss',
    './calendar.scss'
  ]})
export class CalendarComponent {
  protected ds = inject(DataService)
  protected competitions!: Competition[]
  protected competitionCategories!: CompetitionCategory[]
  protected today = new Date().toISOString()
  ngOnInit(): void {
    this.ds.loader.loadingOn()
    this.ds.getCompetitionCategories().subscribe(
      data=>{
        if (data.success){
          this.competitionCategories = data.categories
        }
      },
      error=>console.log(error)
    )
    this.ds.getAllCompetitions().subscribe(
      data=>{
        if(data.success) {
          this.competitions = data.data
          for (const comp of this.competitions) {
            comp.categories = this.competitionCategories.filter(x=>x.versenyid == comp.id).map(x=>x.category)
          }
        }
        this.ds.loader.loadingOff()
      },
      error => console.log(error)
      //backend refactor? controllerek?
    )
      
  }
}
