import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import { Sequence } from 'src/app/class/commun/sequence';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { BddService } from 'src/app/service/bdd.service';
import { FormatDonnees } from 'src/app/class/exploration/format-donnees';
import { TableauExplService } from 'src/app/service/tableau-expl.service';
import { element } from 'protractor';



@Component({
  selector: 'app-train-seq',
  templateUrl: './train-seq.component.html',
  styleUrls: ['./train-seq.component.css']
})
export class TrainSeqComponent implements AfterViewInit {
  selectionListe = new Array<boolean>(this.bdd.sequences.length);
  displayedColumns: string[] = ["Nom","SéquencesTrain","SéquencesTest"];
  displayedColumns2: string[] = [];
  dataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public bdd:BddService,public tab:TableauExplService){
    this.dataSource = new MatTableDataSource<Sequence>(this.bdd.sequences);
  }

  ngAfterViewInit() {
    this.dataSource.paginator= this.paginator;
    for (const [key, value] of Object.entries(this.tab.ajouterMetadonnee( this.bdd.sequences[0].id,'', this.bdd.sequences[0].metaDonnees))) {
      if(key.includes("metadonnees")){
        this.displayedColumns2.push(" "+key.split('.')[2]+" ")
        this.displayedColumns.push(" "+key.split('.')[2]+" ")
      }

    }
    console.log(this.displayedColumns2)

    this.bdd.sequences.forEach(elt=>{
      for (const [key, value] of Object.entries(this.tab.ajouterMetadonnee(elt.id,'',elt.metaDonnees))) {
        if(key.includes("metadonnees")){
          elt.displayedMetadata.set(" "+key.split('.')[2]+" ",value)
      
      
        }
      }
    })
   
  }

  selection(i: number): void{
    this.selectionListe[i] = !this.selectionListe[i];    
  }

  changeSeq(i:number):void{
    this.bdd.sequences[i].isTrain=!this.bdd.sequences[i].isTrain;
  }

  update(s:string):void{
    this.bdd.sequences.forEach(elt=>{
      if(elt.id===s){
          elt.isTest=!elt.isTest;
          elt.isTrain=!elt.isTrain;
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  
}
