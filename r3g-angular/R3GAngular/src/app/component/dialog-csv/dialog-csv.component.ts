import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../apprentissage/apprentissage.component';

@Component({
  selector: 'app-dialog-csv',
  templateUrl: './dialog-csv.component.html',
  styleUrls: ['./dialog-csv.component.css']
})
export class DialogCSVComponent implements OnInit {
 
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    
   }

  ngOnInit(): void {
    console.log(this.data)
  }

}
