import { Component } from '@angular/core';
import { TopBarComponent } from "../top-bar";

@Component({
  selector: 'landing-root',
  imports: [TopBarComponent],
  templateUrl: './landing.html',
  styleUrls: [
    '../../app.scss',
    './landing.scss'
  ]
})
export class LandingPageComponent {
  // https://namba8.com/wp/
  // https://www.facebook.com/groups/607199946958953/
}
