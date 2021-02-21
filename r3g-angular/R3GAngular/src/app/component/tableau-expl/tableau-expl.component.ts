import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {sequencesTab, TableauExplService} from "../../service/tableau-expl.service";
import {VisualisationExploService} from "../../service/visualisation-explo.service";




@Component({
  selector: 'app-tableau-expl',
  templateUrl: './tableau-expl.component.html',
  styleUrls: ['./tableau-expl.component.css']
})
export class TableauExplComponent implements AfterViewInit, OnInit {

  selectionListe: Array<boolean> = new Array<boolean>();
  displayedColumns: string[] = new Array<string>();
  allColumns: string[] = new Array<string>();
  dataSource: MatTableDataSource<sequencesTab> = new MatTableDataSource<sequencesTab>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //subscription: Subscription;


  constructor(public explService: TableauExplService, public visuService: VisualisationExploService) {
    this.selectionListe = new Array<boolean>(this.explService.sequences.length);
    //this.subscription = this.explService.onMessage().subscribe(() => {
      this.updateAll();
    //});

  }

  updateAll(): void{
    console.log(this.explService.sequences);
    this.displayedColumns = Object.keys(this.explService.sequences[0]);
    this.allColumns = Object.assign([],this.displayedColumns);
    this.allColumns.push("addColumn");
    this.allColumns.push("visualisation");
    this.allColumns.push("download");
    this.dataSource = new MatTableDataSource<sequencesTab>(this.explService.sequences);
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
