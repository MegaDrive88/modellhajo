import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";


@Component({
  selector: 'form-group',
  imports: [FormsModule, CommonModule],
  template:`
    <div class="form-group row">
        <label for="{{property_name}}" class="col-md-5 col-form-label">{{placeholder}}<span *ngIf="required" style="color:red;">*</span>: </label>
        <div class="col-md-7">
            <input [disabled]="disabled" (ngModelChange)="ontype($event)" [email]="type == 'email'" type="{{type}}" class="form-control" [(ngModel)]="property_val" placeholder="{{placeholder}}" [required]="required" #err="ngModel" name="{{property_name}}" [min]="0">
        </div>
    </div>
    @if (err.invalid && (err.dirty || err.touched)){
        <p class="formError" *ngIf="err.errors && err.errors['required']">{{placeholder}} nem lehet üres érték</p>
        <p class="formError" *ngIf="err.errors && err.errors['email']">Hibás e-mail cím formátum</p>
    }
  `,
  styleUrl: '../app.scss'
})
export class FormGroup { 
    @Input() placeholder = ''
    @Input() property_val:any = ''
    @Input() property_name = ''
    @Input() required = true
    @Input() type = 'text'
    @Input() disabled = false
    @Output() editEvent = new EventEmitter()
    protected ontype(value: any) {
        this.editEvent.emit({ field: this.property_name, value: value })
    }
}
 