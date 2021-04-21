import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {sequencesTab, sequenceTabImpl, TableauExplService} from "../../service/tableau-expl.service";
import {VisualisationExploService} from "../../service/visualisation-explo.service";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ChoixColonneComponent} from "../choix-colonne/choix-colonne.component";
import {BddService} from "../../service/bdd.service";
import {MatSort} from '@angular/material/sort';
import {sequence} from "@angular/animations";
import {SequencesChargeesService} from "../../service/sequences-chargees.service";
import {FilterComponent} from "../filter/filter.component";
import {EngineExplorationService} from '../engine-exploration/engine-exploration.service';




@Component({
  selector: 'app-tableau-expl',
  templateUrl: './tableau-expl.component.html',
  styleUrls: ['./tableau-expl.component.css']
})
export class TableauExplComponent implements AfterViewInit, OnInit {

  allColumns: string[] = new Array<string>();
  dataSource: MatTableDataSource<sequencesTab> = new MatTableDataSource<sequencesTab>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //subscription: Subscription;
  allComplete: boolean = false;


  constructor(public explService: TableauExplService,
              public bddService: BddService,
              public visuService: VisualisationExploService,
              public engineExplorationService: EngineExplorationService,
              public dialog: MatDialog,
              public sequenceChargees: SequencesChargeesService) {
    this.explService.observableSequences.subscribe((sequence) => {
      if (this.explService.displayedColumns.length > 0) this.updateAll();
    });
    this.explService.observableColumns.subscribe((colonnes) => this.updateAll());
    //this.subscription = this.explService.onMessage().subscribe(() => {
    //});

  }


  updateAll(): void{
    //console.log(this.explService.sequences);
    //this.displayedColumns = Object.keys(this.explService.colonnesAfficher);
    this.allColumns = Object.assign([],this.explService.displayedColumns);
    this.allColumns.push("addColumn");
    this.allColumns.push("visualisation");
    this.allColumns.push("download");
    this.allColumns.push("checkbox");
    this.dataSource = new MatTableDataSource<sequencesTab>(this.explService.sequences);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    // this.bddService.observableSequences.subscribe((sequence) => {
    //   if (sequence.length > 0) {
    //     this.choisirColonne();
    //   }
    // });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  tournerBouton() {
  }

  public choisirColonne() {
    const dialogRef = this.dialog.open(ChoixColonneComponent, {
      data: {colonnes: []}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result !== undefined){
        this.explService.displayedColumns = result.colonnes;
        this.updateAll();
      }
    });
  }

  setSelectedSequence(element: any) {
    if(element instanceof sequenceTabImpl) {
      if(element.selected) {
        this.explService.selectionListe.push(element);
        if(this.explService.sequences.every(s => s.selected)) this.allComplete = true;
      }
      else {
        this.allComplete = false;
        let i=0;
        while(i < this.explService.selectionListe.length) {
          if(this.explService.selectionListe[i] == element) this.explService.selectionListe.splice(i,1);
          i++;
        }
      }
    }
  }

  ajouterSequencesSelectionnees() {
    let seqSelectionee = this.bddService.chercherSequenceTableau(this.explService.selectionListe);
    this.allComplete = false;
    console.log("sequences trouvees");
    this.bddService.getDonnee(seqSelectionee);
    console.log("getDonnees");
    this.sequenceChargees.addToList(seqSelectionee);
    console.log("added to list");
    setTimeout(() => this.engineExplorationService.refreshInitialize(), 1500);
  }

  someComplete(): boolean {
    if(this.explService.sequences == null) {
      return false
    }
    return this.explService.sequences.filter(s => s.selected).length > 0 && ! this.allComplete;
  }

  setAll(checked: boolean) {
    this.explService.selectionListe = [];
    this.allComplete = checked;
    if(this.explService.sequences == null) {
      return;
    }
    this.explService.sequences.forEach(s => s.selected = checked);
    if(checked) {
      this.explService.selectionListe = this.explService.sequences.concat([]);
    }
  }

  openDialogFilter(): void {
    const dialogRef = this.dialog.open(FilterComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result !== undefined) {
        this.explService.filtres.push(result.filter);
        this.explService.filteredList = this.explService.sequences;
        this.explService.filteredList = this.explService.filteredList.filter(result.filter);
      }
    });
  }
}
