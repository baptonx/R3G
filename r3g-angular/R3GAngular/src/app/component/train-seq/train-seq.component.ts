import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import { Sequence } from 'src/app/class/commun/sequence';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';



@Component({
  selector: 'app-train-seq',
  templateUrl: './train-seq.component.html',
  styleUrls: ['./train-seq.component.css']
})
export class TrainSeqComponent implements AfterViewInit {
  selectionListe = new Array<boolean>(this.serviceSeq.sequences.length);
  displayedColumns: string[] = ["Nom","Date","SéquencesTrain","SéquencesTest"];
  dataSource;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public serviceSeq:SequencesChargeesService){
    this.dataSource = new MatTableDataSource<Sequence>(this.serviceSeq.sequences);
  }

  ngAfterViewInit() {
    this.dataSource.paginator= this.paginator;
  }

  selection(i: number): void{
    this.selectionListe[i] = !this.selectionListe[i];    
  }

  changeSeq(i:number):void{
    this.serviceSeq.sequences[i].isTrain=!this.serviceSeq.sequences[i].isTrain;
  }

  update(s:string):void{
    this.serviceSeq.sequences.forEach(elt=>{
      if(elt.id===s){
          elt.isTest=!elt.isTest;
          elt.isTrain=!elt.isTrain;
      }
    })
  }

  
}
