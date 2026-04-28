import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../services/data.service';
import MenuItem from '../../interfaces/menuitem.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'top-bar-root',
  imports: [RouterLink, RouterLinkActive],
  templateUrl:"./top-bar.html",
  styleUrls:["../../app.scss", "./top-bar.scss"]
})
export class TopBarComponent implements OnInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected menuItems: MenuItem[] = []

  ngOnInit(): void {
    if (!this.ds.getUser()) {
      this.menuItems = []
      return
    }

    const cached = this.ds.getMenuItems()
    if (cached) {
      this.menuItems = cached
      return
    }

    this.ds.retrieveMenuItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data.success) {
          this.menuItems = data.items
          this.ds.setMenuItems(data.items)
        }
      },
      error: (err) => {
        console.error('Failed to load menu items', err)
      }
    })
  }
}
