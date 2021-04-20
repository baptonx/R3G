import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {TableauExplService} from "../../service/tableau-expl.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  //operande
  operande = new FormControl();
  optionsOperande: string[] = [];
  filteredOptionsOperande: Observable<string[]> = new Observable<string[]>();
  //operateur
  operateur = new FormControl();
  optionsOperateur: string[] = ['='];
  filteredOptionsOperateur: Observable<string[]> = new Observable<string[]>();

  constructor(public tableauExpl: TableauExplService) {
    this.optionsOperande = this.tableauExpl.displayedColumns;
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

}
