import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DialogCSVComponent} from '../dialog-csv/dialog-csv.component';


@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})


export class ApprentissageComponent implements OnInit {
  modeles = new FormControl();

  modelesList: string[] = ['Modèle 1','Modèle 2','Modèle 3'];
  constructor(public dialog: MatDialog) { }

  openDialog():void{
    const dialogRef = this.dialog.open(DialogCSVComponent, {
      data: {
        doList: ['true', '1', 't', "doglu"],
        listBN: ['true', '1', 't', "doglu"],
        sBs:['true', '1', 't', "dosbs", "sbs", "sidebyside"],
        listMS:['true', '1', 't']
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit(): void {
    
  }

}
export interface DialogData {
  doList: Array<string>
  sBs:Array<string>
  listBN:Array<string>
  listMS:Array<string>
} 