import { Component, inject, OnInit } from '@angular/core';
import { MenuBarComponent } from '../menu-bar/menu-bar';
import { DataService } from '../../services/data.service';
import User from '../../interfaces/user.interface';

@Component({
  selector: 'admin-root',
  imports: [MenuBarComponent],
  templateUrl: './admin.html',
  styleUrls: [
    '../../app.scss',
    './admin.scss'
  ]})
export class AdminComponent implements OnInit{
  protected ds = inject(DataService)
  protected roleRequests: User[] = []
  ngOnInit(): void {
      this.ds.getRoleRequests().subscribe({
          next:(data)=>this.roleRequests = data,
          error:(error)=>console.log(error)
      })
  }
  decideCommand(id:number, verdict: boolean){
      this.ds.decideRoleRequest(verdict, id).subscribe({
          next:(data)=> {
              if(data.success)
              this.ds.router.navigateByUrl('/admin', { replaceUrl: true })
              .then(() => this.ngOnInit())
          },
          error:(error)=>console.log(error)
      })
  }
}
