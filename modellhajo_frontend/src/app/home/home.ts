import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { App } from '../app';


@Component({
  selector: 'home-root',
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: '../app.scss'
})
export class Home extends App {
  
}
