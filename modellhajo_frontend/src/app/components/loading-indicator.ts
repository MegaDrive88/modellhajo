import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef
} from '@angular/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'loading-indicator',
  standalone: true,
  imports: [
    AsyncPipe,
    NgTemplateOutlet,
    MatProgressSpinnerModule
  ],
  template: `
    @if (loading$ | async) {
        <div class="spinner-container">
            @if (customLoadingIndicator) {
            <ng-container
                *ngTemplateOutlet="customLoadingIndicator">
            </ng-container>
            } @else {
            <mat-spinner></mat-spinner>
            }
        </div>
    }
  `,
  styles:`
    .spinner-container {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.32);
        z-index: 2000;
    }
  `,
})
export class LoadingIndicatorComponent implements OnInit {

  loading$: Observable<boolean>;

  @Input()
  detectRouteTransitions = false;

  @ContentChild('loading')
  customLoadingIndicator!: TemplateRef<any>;

  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit() {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap(event => {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingService.loadingOn();
            }
            if (event instanceof RouteConfigLoadEnd) {
              this.loadingService.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }
}