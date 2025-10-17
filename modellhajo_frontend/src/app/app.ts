import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private http = inject(HttpClient);
  protected name = '';
  protected result = '';
  protected send(){
    this.http.get<any>(`http://127.0.0.1:8000/api/hello/${this.name}`).subscribe(data=>this.result=data.message)
  }
}
