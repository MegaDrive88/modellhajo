import { Component } from '@angular/core';
import { TopBarComponent } from "../top-bar";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'landing-root',
  imports: [TopBarComponent, FormsModule],
  templateUrl: './competitionRegister.html',
  styleUrls: [
    '../../app.scss',
    './competitionRegister.scss'
  ]
})
export class CompetitionRegisterComponent {

}
