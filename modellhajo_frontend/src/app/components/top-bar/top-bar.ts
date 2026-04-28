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
  protected groupedMenuItems: { level: number; label: string; items: MenuItem[] }[] = []

  private roleLabel(level: number) {
    switch (level) {
      case 3:
        return 'Adminisztrátor'
      case 2:
        return 'Verseny Rendezés'
      default:
        return 'Versenyzés'
    }
  }

  private buildGroups() {
    const map = new Map<number, MenuItem[]>()
    for (const it of this.menuItems) {
      const lvl = (it as any).min_szerepkor ?? 1
      if (!map.has(lvl)) map.set(lvl, [])
      map.get(lvl)!.push(it)
    }

    const groups = Array.from(map.entries()).map(([level, items]) => ({ level, items }))
    groups.sort((a, b) => b.level - a.level)
    this.groupedMenuItems = groups.map(g => ({ level: g.level, label: this.roleLabel(g.level), items: g.items }))
  }

  ngOnInit(): void {
    if (!this.ds.getUser()) {
      this.menuItems = []
      return
    }

    const cached = this.ds.getMenuItems()
    if (cached) {
      this.menuItems = cached
      this.buildGroups()
      return
    }

    this.ds.retrieveMenuItems().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data.success) {
          this.menuItems = data.items
          this.ds.setMenuItems(data.items)
          this.buildGroups()
        }
      },
      error: (err) => {
        console.error('Failed to load menu items', err)
      }
    })
  }
}
