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
  allComplete1 = false;
  allComplete2 = false;
  modeSelection = '';


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
    if (this.modeSelection === 'annotation' || this.modeSelection === 'evaluation') {
      this.allColumns.push('checkbox1');
    }
    if (this.modeSelection === 'evaluation') {
      this.allColumns.push('checkbox2');
    }
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

  setSelectedSequence(element: any, selection: string): void {
    if (element instanceof SequenceTabImpl) {
      if (this.getSelected(selection, element)) {
        this.getSelectionList(selection).push(element);
        if (this.explService.filteredList.every(s => this.getSelected(selection, s))) { this.setAllComplete(selection, true); }
      }
      else {
        this.setAllComplete(selection, false);
        let i = 0;
        while (i < this.getSelectionList(selection).length) {
          if (this.getSelectionList(selection)[i].equals(element)) { this.getSelectionList(selection).splice(i, 1); }
          i++;
        }
      }
    }
  }

  ajouterSequencesSelectionnees(): void {
    this.sequenceChargees.mode = this.modeSelection;
    if (this.modeSelection === 'annotation') {
      const seqSelectionee = this.bddService.chercherSequenceTableau(this.explService.selectionListe1);
      // this.bddService.getDonnee(seqSelectionee);
      this.sequenceChargees.addToList('select1', seqSelectionee);
    }
    else {
      let seqSelectionee = this.bddService.chercherSequenceTableau(this.explService.selectionListe1);
      // this.bddService.getDonnee(seqSelectionee);
      this.sequenceChargees.addToList('select1', seqSelectionee);
      seqSelectionee = this.bddService.chercherSequenceTableau(this.explService.selectionListe2);
      // this.bddService.getDonnee(seqSelectionee);
      this.sequenceChargees.addToList('select2', seqSelectionee);
    }
    this.allComplete1 = false;
    this.allComplete2 = false;
    setTimeout(() => this.engineExplorationService.refreshInitialize(), 1500);
  }

  someComplete(allComplete: boolean, selection: string): boolean {
    if (this.explService.filteredList == null) {
      return false;
    }
    return this.explService.filteredList.filter(s => this.getSelected(selection, s)).length > 0 && ! allComplete;
  }

  setAll(checked: boolean, selection: string): void {
    this.setSelectionList(selection, []);
    this.setAllComplete(selection, checked);
    if (this.explService.filteredList == null) {
      return;
    }
    this.explService.filteredList.forEach(s => this.setSelected(selection, s, checked));
    if (checked) {
      this.setSelectionList(selection, this.explService.filteredList.concat([]));
    }
  }
  getSelected(selectType: string, seq: SequencesTab): boolean {
    if (selectType === 'select1') {
      return seq.selected1;
    }
    else {
      return seq.selected2;
    }
  }
  setSelected(selectType: string, seq: SequencesTab, value: boolean): void {
    if (selectType === 'select1') {
      seq.selected1 = value;
    }
    else {
      seq.selected2 = value;
    }
  }
  setAllComplete(selectType: string, value: boolean): void {
    if (selectType === 'select1') {
      this.allComplete1 = value;
    }
    else {
      this.allComplete2 = value;
    }
  }
  setSelectionList(selectType: string, newList: Array<SequencesTab>): void {
    if (selectType === 'select1') {
      this.explService.selectionListe1 = newList;
    }
    else {
      this.explService.selectionListe2 = newList;
    }
  }
  getSelectionList(selectType: string): Array<SequencesTab> {
    if (selectType === 'select1') {
      return this.explService.selectionListe1;
    }
    else {
      return this.explService.selectionListe2;
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
        console.log(result.filter(this.explService.filteredList[0]));
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
