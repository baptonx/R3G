import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {sequencesTab, TableauExplService} from "../../service/tableau-expl.service";
import {Subscription} from "rxjs";




@Component({
  selector: 'app-tableau-expl',
  templateUrl: './tableau-expl.component.html',
  styleUrls: ['./tableau-expl.component.css']
})
export class TableauExplComponent implements AfterViewInit, OnInit {

  selectionListe: Array<boolean> = new Array<boolean>();
  displayedColumns: string[] = new Array<string>();
  dataSource: MatTableDataSource<sequencesTab> = new MatTableDataSource<sequencesTab>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //subscription: Subscription;


  constructor(public explService: TableauExplService) {
    this.selectionListe = new Array<boolean>(this.explService.sequences.length);
    //this.subscription = this.explService.onMessage().subscribe(() => {
      this.updateAll();
    //});

  }

  updateAll(): void{
    console.log("updating");
    this.displayedColumns = Object.keys(this.explService.sequences[0]);
    this.dataSource = new MatTableDataSource<sequencesTab>([{id:"1",position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'}]);
  }

  ngOnInit(): void {
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
