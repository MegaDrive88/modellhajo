import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import MenuItem from '../../interfaces/menuitem.interface';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'menu-bar-root',
  imports: [RouterLink],
  templateUrl:"./menu-bar.html",
  styleUrl:"./menu-bar.scss",
})
export class MenuBarComponent implements OnInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected menuItems: MenuItem[] = []

  ngOnInit() {
    this.ds.loader.loadingOn()
    this.ds.checkTokenExpired().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (error) => {
        if (error.status == 401) {
          alert('Lejárt a munkamenet, kérjük jelentkezzen be újra!')
          this.ds.loader.loadingOff()
          this.ds.logout()
        }
      }
    })
    const cached = this.ds.getMenuItems()
    if (!cached) {
      this.ds.retrieveMenuItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => {
          if (data.success) {
            this.menuItems = data.items
            this.ds.setMenuItems(data.items)
          }
          this.ds.loader.loadingOff()
        },
        error: (err) => {
          console.error('Failed to load menu items', err)
          this.ds.loader.loadingOff()
        }
      })
    } else {
      this.menuItems = cached
      this.ds.loader.loadingOff()
    }

    import('bootstrap');
  }
}
