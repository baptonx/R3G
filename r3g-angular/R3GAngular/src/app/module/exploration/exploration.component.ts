import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BddService} from '../../service/bdd.service';
import {PopUpAddBddComponent} from '../../component/pop-up-add-bdd/pop-up-add-bdd.component';
import {MatDialog} from '@angular/material/dialog';
import {PopUpBddTxtToInkmlComponent} from '../../component/pop-up-bdd-txt-to-inkml/pop-up-bdd-txt-to-inkml.component';
import {ChoixColonnesService} from '../../service/choix-colonnes.service';
import {PopUpBddInkmlToTxtComponent} from '../../component/pop-up-bdd-inkml-to-txt/pop-up-bdd-inkml-to-txt.component';

export interface DialogData {
  name: string;
}
export interface DialogDataInkmlToTxt {
  txtPathDossier: string;
}
export class DialogDataInkmlToTxtClass implements DialogDataInkmlToTxt{
  txtPathDossier = '';
}

export interface DialogDataAddPathTxt {
  dataname: string;
  labelsPathDossier: string;
  dataPathDossier: string;
  inkmlPathDossier: string;
  fps: string;
  pathClass: string;
}
export class DialogDataAddPathTxtclass implements DialogDataAddPathTxt{
  dataname = '';
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
  private  dialogDataInkmltoTxt = new DialogDataInkmlToTxtClass();

  constructor(public bdd: BddService, public dialog: MatDialog, public choixColonnesService: ChoixColonnesService) {
    this.pathbdd = '';
    choixColonnesService.parseNode();
  }

  addPathBDDINKML(): void{
    this.bdd.addpath();
  }

  openDialogINKML(): void {
    this.pathbdd = '';
    const dialogRef = this.dialog.open(PopUpAddBddComponent, {
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
    const dialogRef = this.dialog.open(PopUpBddTxtToInkmlComponent, {
      width: '800px',
      data: {labelsPathDossier: this.dialogDataAddPathTxt.labelsPathDossier,
        dataPathDossier: this.dialogDataAddPathTxt.dataPathDossier,
        inkmlPathDossier: this.dialogDataAddPathTxt.inkmlPathDossier,
        dataname: this.dialogDataAddPathTxt.dataname,
        fps: this.dialogDataAddPathTxt.fps,
        pathClass: this.dialogDataAddPathTxt.pathClass
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogDataAddPathTxt = result;
      if (result !== undefined) {
        const data = result as DialogDataAddPathTxt;
        this.bdd.txtToInkml(data.labelsPathDossier, data.dataPathDossier,
          data.inkmlPathDossier + '/' + data.dataname, data.fps, data.pathClass);
      }
    });
  }
  openDialogINKMLtoTXT(bddname: string): void {
    this.dialogDataInkmltoTxt = new DialogDataInkmlToTxtClass();
    const dialogRef = this.dialog.open(PopUpBddInkmlToTxtComponent, {
      width: '800px',
      data: {txtPathDossier: this.dialogDataInkmltoTxt.txtPathDossier
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogDataInkmltoTxt = result;
      if (result !== undefined) {
        const data = result as DialogDataInkmlToTxt;
        this.exporterBddTxt(bddname, data.txtPathDossier);
      }
    });
  }
  reloadDB(namedb: string): void{
    this.bdd.reloaddb(namedb);
  }
  closeDB(namedb: string): void{
    this.bdd.closedb(namedb);
  }
  exporterBddTxt(namedb: string, pathtxt: string): void{
    this.bdd.inkmlTotxt(namedb, pathtxt);
  }
  ngOnInit(): void {
    if (this.bdd.mapSequences.size === 0) {
      this.bdd.setMetaData();
      this.bdd.getlistdb();
    }
  }

  ngAfterViewInit(): void {
  }

}
