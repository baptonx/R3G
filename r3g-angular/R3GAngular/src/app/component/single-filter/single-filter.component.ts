import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {SequencesTab, TableauExplService} from '../../service/tableau-expl.service';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-single-filter',
  templateUrl: './single-filter.component.html',
  styleUrls: ['./single-filter.component.css']
})
export class SingleFilterComponent implements OnInit {
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
  @Input() isFirstFilter!: boolean;
  andOr = 'ou';
  nameSingleFilter = '';
  @Output() changeName = new EventEmitter();
  constructor(public tableauExpl: TableauExplService) {
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
  // Met a jour le nom du sigleFilter
  majNameSingleFilter(): void {
    this.nameSingleFilter = this.isFirstFilter ? '' : ' ' + this.andOr + ' ';
    this.nameSingleFilter += this.operandeInput.nativeElement.value
      + ' ' + this.operateurInput.nativeElement.value
      + ' ' + this.resultInput.nativeElement.value;
    this.changeName.emit();
  }

  public majNameSingleFilterCustom(operandeInput:string,operateurInput:string,resultInput:string): void {
    this.nameSingleFilter = this.isFirstFilter ? '' : ' ' + this.andOr + ' ';
    this.nameSingleFilter +=operandeInput
      + ' ' + operateurInput
      + ' ' + resultInput;
    this.operandeInput.nativeElement.value =operandeInput;
    this.operateurInput.nativeElement.value = operateurInput;
    this.resultInput.nativeElement.value = resultInput;
    this.changeName.emit();
  }

  // Filtre le nom des noms recommandes
  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();

    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  // cree un predicat a partir des entrees
  createSingleFilter(): (geste: SequencesTab) => boolean {
    const operandeValue = this.operandeInput.nativeElement.value;
    const operateurValue = this.operateurInput.nativeElement.value;
    const resultValue = this.resultInput.nativeElement.value;
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
  // renvoie la disjonction ou la conjonction de deux predicats
  createAndOrFunction(): (f1: (geste: SequencesTab) => boolean,
                          f2: (geste: SequencesTab) => boolean) => (geste: SequencesTab) => boolean {
    console.log(this.andOr);
    if (this.andOr === 'et') {
      return (f1, f2) => (geste: SequencesTab) => f1(geste) && f2(geste);
    } else if (this.andOr === 'ou') {
      return (f1, f2) => (geste: SequencesTab) => f1(geste) || f2(geste);
    }
    return (f1, f2) => (geste: SequencesTab) => false;
  }

}
