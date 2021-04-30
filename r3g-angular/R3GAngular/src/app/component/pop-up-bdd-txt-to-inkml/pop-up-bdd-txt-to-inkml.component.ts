import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogDataAddPathTxt} from '../../module/exploration/exploration.component';

@Component({
  selector: 'app-pop-up-add-txt-bdd',
  templateUrl: './pop-up-bdd-txt-to-inkml.component.html',
  styleUrls: ['./pop-up-bdd-txt-to-inkml.component.css']
})
export class PopUpBddTxtToInkmlComponent {

  constructor(
    public dialogRef: MatDialogRef<PopUpBddTxtToInkmlComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataAddPathTxt) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
