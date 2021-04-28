import {Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {SequencesTab} from '../../service/tableau-expl.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SingleFilterComponent} from '../single-filter/single-filter.component';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  @ViewChild('nomFiltreInput') nomFiltreInput!: ElementRef;
  filters: boolean[] = [true];
  @ViewChildren(SingleFilterComponent) childrenFilters: QueryList<SingleFilterComponent> = new QueryList<SingleFilterComponent>();
  nameFilter = '';

  constructor(public dialogRef: MatDialogRef<FilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { filter: (geste: SequencesTab) => boolean, nomFiltre: string }) {
  }

  ngOnInit(): void {
  }

  close(): void {
    const predicate: (geste: SequencesTab) => boolean = this.createFilters();
    this.dialogRef.close({filter: predicate, nomFiltre: this.nomFiltreInput.nativeElement.value});
  }

  private createFilters(): (geste: SequencesTab) => boolean {
    const tabFilters: Array<(geste: SequencesTab) => boolean> = [];
    const tabAndOr: Array<(f1: (geste: SequencesTab) => boolean,
                           f2: (geste: SequencesTab) => boolean) => (geste: SequencesTab) =>  boolean> = [];
    for (const child of this.childrenFilters) {
      tabFilters.push(child.createSingleFilter());
      tabAndOr.push(child.createAndOrFunction());
    }
    let filter: (geste: SequencesTab) => boolean = (seq: SequencesTab) => tabFilters[0](seq);
    let newFilter: (geste: SequencesTab) => boolean;
    for (let i = 1 ; i < tabFilters.length ; i++) {
      newFilter = tabAndOr[i](filter, tabFilters[i]);
      filter = newFilter;
    }
    return filter;
  }

  addSingleFilter(): void {
    this.filters.push(false);
  }

  majNameFilter(): void {
    let name = '';
    let i = 0;
    for (const child of this.childrenFilters) {
      name += child.operandeInput.nativeElement.value + ' ' +
        child.operateurInput.nativeElement.value + ' ' + child.resultInput.nativeElement.value;
      if (i !== this.childrenFilters.length) {
        name += ' ' + child.andOr + ' ';
      }
      i++;
    }
    this.nameFilter = name;
  }
}
