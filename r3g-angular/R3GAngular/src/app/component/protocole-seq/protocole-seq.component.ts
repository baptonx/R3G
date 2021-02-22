import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Sequence } from 'src/app/class/commun/sequence';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';

@Component({
  selector: 'app-protocole-seq',
  templateUrl: './protocole-seq.component.html',
  styleUrls: ['./protocole-seq.component.css']
})
export class ProtocoleSeqComponent implements OnInit {
  selectionListe = new Array<boolean>(this.serviceSeq.sequences.length);
  displayedColumns: string[] = ["Nom","Date","SéquencesTrain","SéquencesTest"];
  dataSource;
  nameFilter = new FormControl('');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  filterValues = {
    name: '',
    id: '',
    colour: '',
    pet: ''
  };

  constructor(public serviceSeq:SequencesChargeesService){
    this.dataSource = new MatTableDataSource<Sequence>(this.serviceSeq.sequences);
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
