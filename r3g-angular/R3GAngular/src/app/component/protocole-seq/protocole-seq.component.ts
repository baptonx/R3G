import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Sequence } from 'src/app/class/commun/sequence';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { TableauExplService } from 'src/app/service/tableau-expl.service';

@Component({
  selector: 'app-protocole-seq',
  templateUrl: './protocole-seq.component.html',
  styleUrls: ['./protocole-seq.component.css']
})
export class ProtocoleSeqComponent implements OnInit {
  selectionListe = new Array<boolean>(this.bdd.sequences.length);
  displayedColumns: string[] = ["Métadonnée","Opérateur","Valeur"];
  dataSource;
  metadata:Array<String> = []
  operateur:Array<String> = ['=','/=/','<','>']
  valeur:Array<String> = []
  nameFilter = new FormControl('');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  filterValues = {
    name: '',
    id: '',
    colour: '',
    pet: ''
  };

  constructor(public bdd:BddService,public tab:TableauExplService){
      for (const [key, value] of Object.entries(this.tab.ajouterMetadonnee(this.bdd.sequences[0].id,'',this.bdd.sequences[0].metaDonnees))) {
        if(key.includes("metadonnees")){
          this.metadata.push(key.split('.')[2])
          this.valeur.push('')
      
        }
      
    }
    this.dataSource = new MatTableDataSource<String>(this.metadata);
  }
  ngOnInit(): void {
    this.nameFilter.valueChanges
    .subscribe(
      name => {
        this.filterValues.name = name;
        this.dataSource.filter = JSON.stringify(this.filterValues);
      }
    )
  }

  ngAfterViewInit() {
    this.dataSource.paginator= this.paginator
   
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
