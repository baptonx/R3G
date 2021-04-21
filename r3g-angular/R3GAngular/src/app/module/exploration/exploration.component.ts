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
  @ViewChild('inputFiltre') inputFiltre!: MatInput;
  //@viewChild()
  picker = document.getElementById('picker');
  listing = document.getElementById('listing');
  private pathbdd: string;

  constructor(public bdd: BddService, public visuService: VisualisationExploService, public choixColonnes: ChoixColonnesService, public dialog: MatDialog) {
    this.pathbdd = "";
  }

  addPathBDD(): void{
    this.bdd.addpath();
    console.log("addPath");
  }
  reloadDB(namedb: string): void{
    this.bdd.reloaddb(namedb);
    console.log("reload" + namedb);
  }
  closeDB(namedb: string): void{
    this.bdd.closedb(namedb);
    console.log("closed" + namedb);
  }
  openDialog(): void {
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
  ngOnInit(): void {
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
    this.bdd.setMetaData();
    this.bdd.getlistdb();
    console.log(this.bdd)
  }

}
