import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-reset-password-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password-component.html',
  styleUrls: [
    '../../app.scss',
    './reset-password-component.scss'
  ]
})
export class ResetPasswordComponent implements OnInit {
  protected email = '';
  protected token = '';
  protected newPassword = '';
  protected confPassword = '';
  protected ready = false;

  private readonly ds = inject(DataService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.ready = Boolean(this.email && this.token);

    if (!this.ready) {
      Swal.fire({
        title: 'A jelszó-visszaállító link hibás vagy lejárt.',
        theme: 'material-ui-dark',
        icon: 'error'
      });
    }
  }

  send(): void {
    if (!this.ready) return;

    if (!this.newPassword || !this.confPassword) {
      Swal.fire({
        title: 'Töltse ki az összes mezőt',
        theme: 'material-ui-dark',
        icon: 'warning'
      });
      return;
    }

    this.ds.resetPassword({
      email: this.email,
      token: this.token,
      new_password: this.newPassword,
      conf_password: this.confPassword,
    }).subscribe({
      next: (data) => {
        if (data.success) {
          Swal.fire({
            title: 'Jelszó sikeresen módosítva',
            theme: 'material-ui-dark',
            icon: 'success'
          }).then(() => this.ds.router.navigateByUrl('/login'));
        } else {
          Swal.fire({
            title: 'Nem sikerült a módosítás',
            text: data.error ?? 'Ismeretlen hiba',
            theme: 'material-ui-dark',
            icon: 'error'
          });
        }
      },
      error: () => {
        Swal.fire({
          title: 'Hiba történt',
          text: 'Próbálja újra később.',
          theme: 'material-ui-dark',
          icon: 'error'
        });
      }
    });
  }
}