import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TranslatePipe } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { TopBarComponent } from '../top-bar/top-bar';
import Role from '../../interfaces/role.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'user-register-root',
  imports: [FormsModule, RouterLink, TranslatePipe, TopBarComponent],
  templateUrl: './userRegister.html',
  styleUrls: [
    '../../app.scss',
    './userRegister.scss'
  ]})
export class UserRegisterComponent implements OnInit {
  private ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected roles: Role[] = []
  protected newUser: any = {
    megjeleno_nev: "",
    felhasznalonev: "",
    email: "",
    password : "",
    conf_password : "",
    szerepkor_id: null,
    mmszid: ""
  }
  protected errorString = ""
  get selectedRoleLevel(): number {
    if (!this.newUser.szerepkor_id) return 0
    return this.roles.find(r => r.id === this.newUser.szerepkor_id)?.szint ?? 0
  }
  ngOnInit(): void {
    this.ds.getRoles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data.success) {
          this.roles = data.roles.filter(r => r.szint <= 2)
          const defaultRole = this.roles.find(r => r.szerepkor_nev.toLowerCase() === 'versenyző') ?? this.roles[0]
          if (defaultRole) {
            this.newUser.szerepkor_id = defaultRole.id
          }
        }
      },
      error: () => {
        Swal.fire({title: 'Hiba történt a szerepkörök betöltésekor.', theme: 'material-ui-dark', icon: 'error'})
      }
    })
  }
  protected sendRegisterData(){
    if(!this.newUser.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) return // valami message
    this.ds.createAccount(this.newUser).subscribe({
      next: (data)=>{
        if(data.success){
          Swal.fire({title: "Sikeres felhasználó létrehozás", theme: "material-ui-dark", text: "Amennyiben rendezőként regisztrált, várnia kell, míg az adminisztrátor megadja a megfelelő rangot", icon: 'success'})
          this.ds.router.navigateByUrl("/login")
        }
        else{
          this.errorString = data.error
        }
      },
      error:()=>{
        Swal.fire({title: 'Szerverhiba, próbálja újra később!', theme: 'material-ui-dark', icon: 'error'})
      }
    })
  }
}
