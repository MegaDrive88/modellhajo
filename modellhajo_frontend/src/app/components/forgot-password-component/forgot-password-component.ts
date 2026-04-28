import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-forgot-password-component',
  imports: [FormsModule],
  templateUrl: './forgot-password-component.html',
  styleUrls: [
    '../../app.scss',
    './forgot-password-component.scss'
  ]
})
export class ForgotPasswordComponent {
  protected email!: string
  private ds = inject(DataService)
  send(){
    if (!this.email || !this.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      Swal.fire({
        title: "Hibás e-mail cím formátum",
        theme: "material-ui-dark",
        icon: 'warning'
      })
      return
    }
    this.ds.forgotPassword(this.email).subscribe({
      next: () => {
        Swal.fire({
          title: "Nézze meg az e-mailjeit!",
          theme: "material-ui-dark",
          icon: 'success'
        })
      },
      error: (err) => {
        if (err?.error?.error === 'USER_NOT_FOUND') {
          Swal.fire({
            title: "Nincs ilyen e-mail címmel felhasználó",
            theme: "material-ui-dark",
            icon: "warning"
          })
          return
        }
        Swal.fire({
          title: "Hiba történt, próbálja újra később",
          theme: "material-ui-dark",
          icon: "error"
        })
      }
    })
  }
}
