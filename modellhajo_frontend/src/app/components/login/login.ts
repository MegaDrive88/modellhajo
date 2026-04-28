import { DataService } from './../../services/data.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Md5 } from 'ts-md5';
import Swal from 'sweetalert2';
import { TopBarComponent } from "../top-bar/top-bar";

@Component({
  selector: 'login-root',
  imports: [FormsModule, RouterLink, TopBarComponent],
  templateUrl: './login.html',
  styleUrls: [
    '../../app.scss',
    './login.scss'
  ]})
export class LoginComponent implements OnInit {
  protected ds = inject(DataService)
  private destroyRef = inject(DestroyRef)
  protected usernameOrEmail = ''
  protected password = ''
  protected loginSuccess = true

  ngOnInit() {
    if (this.ds.getUser()) {
      this.ds.router.navigateByUrl('/dashboard');
    }
  }

  sendLoginData(){
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/
    const isEmail = emailRegex.test(this.usernameOrEmail)

    this.loginSuccess = true
    const loginModel = {
      user: this.usernameOrEmail,
      isEmail: isEmail,
      pwdHash: Md5.hashStr(`PasswordSalted${this.password}`)
    }
    this.ds.login(loginModel).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.loginSuccess = data.success
        if (data.success) {
          this.ds.setUser(data.user!)
          this.ds.setToken(data.access_token!)
          const roleLevel = (data.user && data.user.role && data.user.role.szint) ? data.user.role.szint : 0
          if (roleLevel >= 2 && !data.user?.szerepkor_elfogadva) {
            this.ds.router.navigateByUrl('/my_entries')
          } else {
            this.ds.router.navigateByUrl('/dashboard')
          }
        }
      },
      error: () => {
        Swal.fire({title: 'Szerverhiba, próbálja újra később!', theme: 'material-ui-dark', icon: 'error'})
      }
    })
  }
}
