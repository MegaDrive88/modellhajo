import { Component, inject } from '@angular/core';
import { TopBarComponent } from "../top-bar/top-bar";
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'landing-root',
  imports: [TopBarComponent, RouterLink],
  templateUrl: './landing.html',
  styleUrls: [
    '../../app.scss',
    './landing.scss'
  ]
})
export class LandingPageComponent {
  private readonly ds = inject(DataService)
  private readonly router = inject(Router)
  // https://namba8.com/wp/
  // https://www.facebook.com/groups/607199946958953/
  WIPalert(){
    Swal.fire({title: 'Hamarosan', theme: 'material-ui-dark', icon: 'info'})
  }

  goToRegistration(){
    const token = this.ds.getToken()
    if (!token) {
      this.router.navigateByUrl('/login')
      return
    }

    this.router.navigate(['/calendar'], { queryParams: { openOnly: 1 } })
  }
}
