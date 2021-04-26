import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {SequencesTab, SequenceTabImpl, TableauExplService} from '../../service/tableau-expl.service';
import {VisualisationExploService} from '../../service/visualisation-explo.service';
import {MatDialog} from '@angular/material/dialog';
import {ChoixColonneComponent} from '../choix-colonne/choix-colonne.component';
import {BddService} from '../../service/bdd.service';
import {MatSort} from '@angular/material/sort';
import {SequencesChargeesService} from '../../service/sequences-chargees.service';
import {FilterComponent} from '../filter/filter.component';
import {EngineExplorationService} from '../engine-exploration/engine-exploration.service';




@Component({
  selector: 'app-tableau-expl',
  templateUrl: './tableau-expl.component.html',
  styleUrls: ['./tableau-expl.component.css']
})
export class TableauExplComponent implements AfterViewInit, OnInit {

  allColumns: string[] = new Array<string>();
  dataSource: MatTableDataSource<SequencesTab> = new MatTableDataSource<SequencesTab>();
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  // subscription: Subscription;
  allComplete = false;


  constructor(public explService: TableauExplService,
              public bddService: BddService,
              public visuService: VisualisationExploService,
              public engineExplorationService: EngineExplorationService,
              public dialog: MatDialog,
              public sequenceChargees: SequencesChargeesService) {
    this.explService.observableSequences.subscribe(() => {
      if (this.explService.displayedColumns.length > 0) {
        this.updateAll();
      }
    });
    this.explService.observableColumns.subscribe(() => this.updateAll());
    // this.subscription = this.explService.onMessage().subscribe(() => {
    // });

  }


  updateAll(): void{
    // this.displayedColumns = Object.keys(this.explService.colonnesAfficher);
    this.allColumns = Object.assign([], this.explService.displayedColumns);
    this.allColumns.push('addColumn');
    this.allColumns.push('visualisation');
    this.allColumns.push('download');
    this.allColumns.push('checkbox');
    this.dataSource.data = this.explService.filteredList;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  tournerBouton(): void {
  }

  public choisirColonne(): void {
    const dialogRef = this.dialog.open(ChoixColonneComponent, {
      data: {colonnes: []}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined){
        this.explService.displayedColumns = result.colonnes;
        this.updateAll();
      }
    });
  }

  setSelectedSequence(element: any): void {
    if (element instanceof SequenceTabImpl) {
      if (element.selected) {
        this.explService.selectionListe.push(element);
        if (this.explService.filteredList.every(s => s.selected)) { this.allComplete = true; }
      }
      else {
        this.allComplete = false;
        let i = 0;
        while (i < this.explService.selectionListe.length) {
          if (this.explService.selectionListe[i].equals(element)) { this.explService.selectionListe.splice(i, 1); }
          i++;
        }
      }
    }
  }

  ajouterSequencesSelectionnees(): void {
    const seqSelectionee = this.bddService.chercherSequenceTableau(this.explService.selectionListe);
    this.allComplete = false;
    this.bddService.getDonnee(seqSelectionee);
    this.sequenceChargees.addToList(seqSelectionee);
    setTimeout(() => this.engineExplorationService.refreshInitialize(), 1500);
  }

  someComplete(): boolean {
    if (this.explService.filteredList == null) {
      return false;
    }
    return this.explService.filteredList.filter(s => s.selected).length > 0 && ! this.allComplete;
  }

  setAll(checked: boolean): void {
    this.explService.selectionListe = [];
    this.allComplete = checked;
    if (this.explService.filteredList == null) {
      return;
    }
    this.explService.filteredList.forEach(s => s.selected = checked);
    if (checked) {
      this.explService.selectionListe = this.explService.filteredList.concat([]);
    }
  }

  openDialogFilter(): void {
    const dialogRef = this.dialog.open(FilterComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.explService.nomFiltres.push(result.nomFiltre);
        this.explService.filtres.push(result.filter);
        this.explService.filteredList = this.explService.filteredList.filter(result.filter);
        this.updateAll();
      }
    });
  }

  remove(i: number): void {
    this.explService.filtres.splice(i, 1);
    this.explService.nomFiltres.splice(i, 1);
    this.explService.reloadFiltres();
    this.updateAll();
  }
}
