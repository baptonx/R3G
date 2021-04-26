import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatInput} from '@angular/material/input';
import {BddService} from '../../service/bdd.service';
import {VisualisationExploService} from '../../service/visualisation-explo.service';
import {ChoixColonnesService} from '../../service/choix-colonnes.service';
import {PopUpComponent} from '../../component/pop-up/pop-up.component';
import {MatDialog} from '@angular/material/dialog';

export interface DialogData {
  name: string;
}

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})

export class ExplorationComponent implements OnInit, AfterViewInit {
  //@viewChild()
  private pathbdd: string;

  constructor(public bdd: BddService, public dialog: MatDialog) {
    this.pathbdd = "";

  }

  addPathBDDINKML(): void{
    this.bdd.addpath();
  }

  openDialogINKML(): void {
    const dialogRef = this.dialog.open(PopUpComponent, {
      width: '250px',
      data: {name: this.pathbdd}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.pathbdd = result;
      if(this.pathbdd != undefined) {
        this.bdd.addbddwithpath(this.pathbdd);
      }
    });
  }
  addPathBDDTXT(): void{
    this.bdd.addpathtxt();
  }
  openDialogTXT(): void {
    const dialogRef = this.dialog.open(PopUpComponent, {
      width: '250px',
      data: {name: this.pathbdd}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.pathbdd = result;
      if(this.pathbdd != undefined) {
        this.bdd.addbddwithpath(this.pathbdd);
      }
    });
  }
  reloadDB(namedb: string): void{
    this.bdd.reloaddb(namedb);
  }
  closeDB(namedb: string): void{
    this.bdd.closedb(namedb);
  }
  exporterSeq(): void{
    if(this.bdd.tableauExpl.selectionListe.length == 0){
      window.alert("Aucune séquence sélectionnée");
    }else{

    }
  }
  ngOnInit(): void {
    if(this.bdd.sequences.length === 0) {
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
