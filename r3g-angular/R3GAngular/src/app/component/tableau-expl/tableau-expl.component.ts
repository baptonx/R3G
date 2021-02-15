import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatInput} from "@angular/material/input";

export interface sequencesTab {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  [key: string]: any
}

let ELEMENT_DATA: sequencesTab[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'}, // Faire une classe séquence
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
  {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
  {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
  {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
  {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
  {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
  {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
  {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
  {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
  {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
];

@Component({
  selector: 'app-tableau-expl',
  templateUrl: './tableau-expl.component.html',
  styleUrls: ['./tableau-expl.component.css']
})
export class TableauExplComponent implements AfterViewInit, OnInit {
  selectedSeq: Array<string>; // Contient les indices des séquences sélectionnées
  @ViewChild('inputFiltre') inputFiltre!: MatInput;
  selectionListe = new Array<boolean>(ELEMENT_DATA.length);
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<sequencesTab>(ELEMENT_DATA);
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor() {
    this.selectedSeq = ['sequence 1', 'sequence 2', 'sequence 3', 'sequence 4', 'sequence 5', 'sequence 6', 'sequence 7', 'sequence 8', 'sequence 9', 'sequence 10'];
  }

  ngOnInit(): void {
  }
  deleteSeq(i: number): void{
    this.selectedSeq.splice(i,1);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  selection(i: number): void{
    this.selectionListe[i] = !this.selectionListe[i];
    console.log(this.selectionListe);
    console.log(i);
  }

  tournerBouton() {
  }
}
