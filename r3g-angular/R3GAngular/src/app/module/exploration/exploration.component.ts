import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BddService} from '../../service/bdd.service';
import {PopUpComponent} from '../../component/pop-up/pop-up.component';
import {MatDialog} from '@angular/material/dialog';
import {PopUpAddTxtBddComponent} from '../../component/pop-up-add-txt-bdd/pop-up-add-txt-bdd.component';
import {ChoixColonnesService} from '../../service/choix-colonnes.service';

export interface DialogData {
  name: string;
}

export interface DialogDataAddPathTxt {
  labelsPathDossier: string;
  dataPathDossier: string;
  inkmlPathDossier: string;
  fps: string;
  pathClass: string;
}
export class DialogDataAddPathTxtclass implements DialogDataAddPathTxt{
  labelsPathDossier = '';
  dataPathDossier = '';
  inkmlPathDossier = '';
  fps = '';
  pathClass = '';
}

export interface DialogData {
  name: string;
}

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})

export class ExplorationComponent implements OnInit, AfterViewInit {
  // @viewChild()
  picker = document.getElementById('picker');
  listing = document.getElementById('listing');
  private pathbdd: string;
  private dialogDataAddPathTxt = new DialogDataAddPathTxtclass();

  constructor(public bdd: BddService, public dialog: MatDialog, public choixColonnesService: ChoixColonnesService) {
    this.pathbdd = '';
    choixColonnesService.parseNode();
  }

  addPathBDDINKML(): void{
    this.bdd.addpath();
  }

  openDialogINKML(): void {
    this.pathbdd = '';
    const dialogRef = this.dialog.open(PopUpComponent, {
      width: '250px',
      data: {name: this.pathbdd}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.pathbdd = result;
      if (this.pathbdd !== undefined) {
        this.bdd.addbddwithpath(this.pathbdd);
      }
    });
  }
  openDialogTXTtoINKML(): void {
    this.dialogDataAddPathTxt = new DialogDataAddPathTxtclass();
    const dialogRef = this.dialog.open(PopUpAddTxtBddComponent, {
      width: '800px',
      data: {labelsPathDossier: this.dialogDataAddPathTxt.labelsPathDossier,
        dataPathDossier: this.dialogDataAddPathTxt.dataPathDossier,
        inkmlPathDossier: this.dialogDataAddPathTxt.inkmlPathDossier,
        fps: this.dialogDataAddPathTxt.fps,
        pathClass: this.dialogDataAddPathTxt.pathClass
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogDataAddPathTxt = result;
      if (result !== undefined) {
        const data = result as DialogDataAddPathTxt;
        this.bdd.txtToInkml(data.labelsPathDossier, data.dataPathDossier,
          data.inkmlPathDossier, data.fps, data.pathClass);
      }
    });
  }
  reloadDB(namedb: string): void{
    this.bdd.reloaddb(namedb);
  }
  closeDB(namedb: string): void{
    this.bdd.closedb(namedb);
  }
  exporterBddTxt(namedb: string): void{
    this.bdd.exporteBddTxt(namedb);
  }
  ngOnInit(): void {
    if (this.bdd.mapSequences.size === 0) {
      this.bdd.setMetaData();
      this.bdd.getlistdb();
    }
  }
  /*
  importBase(): void{

    // @ts-ignore
    picker.addEventListener('change', e => {
      // @ts-ignore
      for (const file of Array.from(e.target.files)) {
        const item = document.createElement('li');
        // @ts-ignore
        item.textContent = file.webkitRelativePath;
        // @ts-ignore
        listing.appendChild(item);
      }
    });
  }*/

  ngAfterViewInit(): void {
  }

}
