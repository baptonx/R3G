import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {SequencesTab, TableauExplService} from '../../service/tableau-expl.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @ViewChild('nomFiltreInput') nomFiltreInput!: ElementRef;
  // operande
  operande = new FormControl();
  optionsOperande: string[] = [];
  filteredOptionsOperande: Observable<string[]> = new Observable<string[]>();
  @ViewChild('operandeInput') operandeInput!: ElementRef;
  // operateur
  operateur = new FormControl();
  optionsOperateur: string[] = ['=', 'contient'];
  filteredOptionsOperateur: Observable<string[]> = new Observable<string[]>();
  @ViewChild('operateurInput') operateurInput!: ElementRef;
  // result
  @ViewChild('resultInput') resultInput!: ElementRef;

  constructor(public tableauExpl: TableauExplService,
              public dialogRef: MatDialogRef<FilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { filter: (geste: SequencesTab) => boolean, nomFiltre: string }) {
    this.optionsOperande = this.tableauExpl.allAttributes;
  }

  ngOnInit(): void {
    this.filteredOptionsOperande = this.operande.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.optionsOperande))
      );
    this.filteredOptionsOperateur = this.operateur.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.optionsOperateur))
      );
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();

    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  createFilter(operandeValue: string, operateurValue: string, resultValue: string): (geste: SequencesTab) => boolean {
    let operateurFunc = (geste: SequencesTab) => false;
    if (operateurValue === '=') {
      operateurFunc = (geste: SequencesTab) => String(geste[operandeValue]) === resultValue;
    }
    else if (operateurValue === 'contient') {
      operateurFunc = (geste: SequencesTab) => String(geste[operandeValue]).includes(resultValue);
    }
    return (geste: SequencesTab) => {
      if (geste[operandeValue] != null) {
        return operateurFunc(geste);
      }
      return false;
    };
  }

  close(): void {
    const operandeValue = this.operandeInput.nativeElement.value;
    const operateurValue = this.operateurInput.nativeElement.value;
    const resultValue = this.resultInput.nativeElement.value;
    const predicate: (geste: SequencesTab) => boolean = this.createFilter(operandeValue, operateurValue, resultValue);
    this.dialogRef.close({filter: predicate, nomFiltre: this.nomFiltreInput.nativeElement.value});
  }
}
