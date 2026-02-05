import { DataService } from './../services/data.service';
import { Component, AfterViewInit, inject } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { App } from '../app';

@Component({
  selector: 'menu-bar-root',
  imports: [],
  template:`
<nav class="navbar navbar-expand-lg fancy-navbar fixed-top">
  <div class="container-fluid px-4">
    <a class="navbar-brand" href="/">Főoldal</a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
      data-bs-target="#navbarNavDropdown">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
      <ul class="navbar-nav align-items-center gap-4">
        <li class="nav-item">
          <a class="nav-link active" href="#">Áttekintés</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Adatmódosítás</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
            Egyéb
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <!-- <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Something else</a></li> -->
            <!-- ngfor -->
          </ul>
        </li>

        <li class="nav-item">
          <button class="btn btn-primary px-4 rounded-pill" (click)="dataservice.logout()">Kijelentkezés</button>
        </li>
      </ul>
    </div>
  </div>
</nav>
`,
styles:`
.fancy-navbar {
  background: linear-gradient(135deg, var(--mat-sys-primary), var(--mat-sys-on-secondary-fixed));
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.fancy-navbar .navbar-brand,
.fancy-navbar .nav-link {
  color: #fff !important;
  position: relative;
  transition: all 0.3s ease;
}
.navbar-brand{
    font-weight:500;
}
.fancy-navbar .nav-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  transition: all 0.3s ease;
  background: var(--mat-sys-primary)
}
.fancy-navbar .dropdown-toggle::after {
    position:static;
    background:none;
}
.fancy-navbar .nav-link:hover::after {
  width: 100%;
  left: 0;
}
.fancy-navbar .dropdown-toggle:hover::after {
    width: auto;
}
.fancy-navbar .nav-link:hover {
  color: #0d6efd !important;
}
.fancy-navbar .dropdown-menu {
  border-radius: 12px;
  overflow: hidden;
}
`,
})
export class MenuBarComponent implements AfterViewInit {
  protected dataservice = inject(DataService)
  async ngAfterViewInit() {
      await import('bootstrap');
  }
}
