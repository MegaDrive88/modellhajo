import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";


@Component({
  selector: 'form-group',
  imports: [FormsModule, CommonModule],
  template:`
    <div class="form-group row">
        <label for="inputPassword" class="col-md-2 col-form-label">{{placeholder}}: </label>
        <div class="col-md-3">
            <input (ngModelChange)="ontype($event)" type="text" class="form-control" [(ngModel)]="property_val" placeholder="{{placeholder}}" required #err="ngModel" name="dispname">
        </div>
    </div>
    @if (err.invalid && (err.dirty || err.touched)){
        <p class="formError">{{placeholder}} nem lehet üres érték</p>
    }
  `,
  styleUrl: '../app.scss'
})
export class FormGroup { 
    @Input() placeholder = ''
    @Input() property_val = ''
    @Input() property_name = ''
    @Output() editEvent = new EventEmitter()
    protected ontype(value: any) {
        this.editEvent.emit({ field: this.property_name, value: value })
    }
}
 