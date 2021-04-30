import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogDataAddPathTxt, DialogDataInkmlToTxt} from '../../module/exploration/exploration.component';

@Component({
  selector: 'app-pop-up-bdd-inkml-to-txt',
  templateUrl: './pop-up-bdd-inkml-to-txt.component.html',
  styleUrls: ['./pop-up-bdd-inkml-to-txt.component.css']
})
export class PopUpBddInkmlToTxtComponent {

  constructor( public dialogRef: MatDialogRef<PopUpBddInkmlToTxtComponent>,
               @Inject(MAT_DIALOG_DATA) public data: DialogDataInkmlToTxt) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
