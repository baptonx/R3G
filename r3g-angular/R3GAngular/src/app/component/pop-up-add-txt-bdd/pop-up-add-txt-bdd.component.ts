import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogDataAddPathTxt} from '../../module/exploration/exploration.component';

@Component({
  selector: 'app-pop-up-add-txt-bdd',
  templateUrl: './pop-up-add-txt-bdd.component.html',
  styleUrls: ['./pop-up-add-txt-bdd.component.css']
})
export class PopUpAddTxtBddComponent {

  constructor(
    public dialogRef: MatDialogRef<PopUpAddTxtBddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataAddPathTxt) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
