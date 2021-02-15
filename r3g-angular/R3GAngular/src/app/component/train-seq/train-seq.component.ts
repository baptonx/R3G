import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import { Sequence } from 'src/app/class/commun/sequence';
import {MatRadioModule} from '@angular/material/radio';



@Component({
  selector: 'app-train-seq',
  templateUrl: './train-seq.component.html',
  styleUrls: ['./train-seq.component.css']
})
export class TrainSeqComponent implements AfterViewInit {
  ELEMENT_DATA: Array<Sequence>=[new Sequence("Sequence 1"),new Sequence("Sequence_2"),new Sequence("Sequence_3"),new Sequence("Sequence_4"),new Sequence("Sequence_5")];
  selectionListe = new Array<boolean>(this.ELEMENT_DATA.length);
  displayedColumns: string[] = ["Nom","Date","SéquencesTrain","SéquencesTest"];
  dataSource = new MatTableDataSource<Sequence>(this.ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator= this.paginator;
  }

  selection(i: number): void{
    this.selectionListe[i] = !this.selectionListe[i];
    console.log(this.selectionListe);
    console.log(i);
    
  }

  changeSeq(i:number):void{
    this.ELEMENT_DATA[i].isTrain=!this.ELEMENT_DATA[i].isTrain;
  }

  update(s:string):void{
    this.ELEMENT_DATA.forEach(elt=>{
      if(elt.id===s){
          elt.isTest=!elt.isTest;
          elt.isTrain=!elt.isTrain;
      }
    })
    console.log(this.ELEMENT_DATA[0].isTrain)
  }

  
}
