import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { TranslatePipe } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'user-register-root',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './userRegister.html',
  styleUrls: [
    '../../app.scss',
    './userRegister.scss'
  ]})
export class UserRegisterComponent {
  private ds = inject(DataService)
  protected newUser: any = {
    megjeleno_nev: "",
    felhasznalonev: "",
    email: "",
    password : "",
    conf_password : "",
    szerepkor_id: 4,
    mmszid: ""
  }
  protected errorString = ""
  protected sendRegisterData(){
    this.ds.createAccount(this.newUser).subscribe({
      next: (data)=>{
        if(data.success){
          Swal.fire({title: "Sikeres felhasználó létrehozás", theme: "material-ui-dark"})
          this.ds.router.navigateByUrl("/login")
        }
        else{
          this.errorString = data.error
        }
      },
      error:()=>{
        Swal.fire({title: 'Szerverhiba, próbálja újra később!', theme: 'material-ui-dark'})
      }
    })
  }
}
