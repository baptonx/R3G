import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';
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
  operateur:Array<Array<String>> = []
  operateur_test:Array<Array<String>> = []
  valeur:Array<String> = []
  valeur_test:Array<String> = []
  nameFilter = new FormControl('');
  train: Array<Array<String>> = []
  test: Array<Array<String>> = []

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
          this.valeur_test.push('')
          this.train.push(['','',''])
          this.test.push(['','',''])
          this.operateur.push(['=','/=/','<','>'])
          this.operateur_test.push(['=','/=/','<','>'])
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

  changeVal(event: any, i:number):void{

          this.train[i][0]=this.metadata[i]
          this.train[i][2]=event.target.value
    }

    changeValTest(event: any, i:number):void{

      this.test[i][0]=this.metadata[i]
      this.test[i][2]=event.target.value
}


  change(event: any, i:number):void
  {
   this.train[i][1]=event.source.value
   console.log(this.train)
  }

  validate(){
    this.bdd.sequences.forEach(seq=>{
      seq.isTest=true
      seq.isTrain=true
      for(var i = 0;i<this.train.length; i++){
      for (const [key, value] of Object.entries(this.tab.ajouterMetadonnee(seq.id,'',seq.metaDonnees))) {


          switch(this.train[i][1]){

            case "=":
              if(this.train[i][0]==String(key.split('.')[2]) && this.train[i][2]!=String(value)){
                seq.isTrain=false
                console.log('here')

              }
              break;
            case "/=/":
                if(this.train[i][0]==String(key.split('.')[2]) && this.train[i][2]==String(value)){
                  seq.isTrain=false
                }
                break;
            case "<":
              if(this.train[i][0]==String(key.split('.')[2]) && this.train[i][2]>String(value)){
                seq.isTrain=false
              }
              break;
            case ">":
            if(this.train[i][0]==String(key.split('.')[2]) && this.train[i][2]<String(value)){
                seq.isTrain=false
              }
              break;
          }
        }
  }
    })
 console.log(this.bdd.sequences)
}

changeTest(event: any, i:number):void
{
 this.test[i][1]=event.source.value
 console.log(this.test)
}


}
