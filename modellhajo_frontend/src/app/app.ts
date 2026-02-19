import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet, NavigationEnd } from '@angular/router';
import { LoadingIndicatorComponent } from './components/loading-indicator';
import { DataService } from './services/data.service';
import { filter, switchMap, distinctUntilChanged, map, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingIndicatorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private ds = inject(DataService)
  private destroyRef = inject(DestroyRef)

  ngOnInit() {
    // Check token expiry once per navigation (not on every menu-bar mount)
    // https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request -> nem kell ennyire tulbonyolitani ez alapjan
    this.ds.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      distinctUntilChanged(),
      debounceTime(50),
      filter(() => !!this.ds.getUser()),
      switchMap(() => this.ds.checkTokenExpired()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error) => {
        if (error.status === 401) {
          alert('Lejárt a munkamenet, kérjük jelentkezzen be újra!')
          this.ds.logout()
        }
      }
    })
  }
}
