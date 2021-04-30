import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogData} from '../../module/exploration/exploration.component';

@Component({
  selector: 'app-pop-up',
  templateUrl: 'pop-up-add-bdd.component.html',
})
export class PopUpAddBddComponent {

  constructor(
    public dialogRef: MatDialogRef<PopUpAddBddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
