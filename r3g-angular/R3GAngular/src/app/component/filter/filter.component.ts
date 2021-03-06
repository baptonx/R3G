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
  @ViewChild('sequencesNames') sequencesNames!: ElementRef;
  @ViewChild('nomFiltreInput') nomFiltreInput!: ElementRef;
  // Tableau de boolean binde dans le template html avec les components SingleFiltres. Le booleen indique si c'est le premier filtre ou non.
  filters: boolean[] = [true];
  @ViewChildren(SingleFilterComponent) childrenFilters: QueryList<SingleFilterComponent> = new QueryList<SingleFilterComponent>();
  nameFilter = '';

  constructor(public dialogRef: MatDialogRef<FilterComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { filter: (geste: SequencesTab) => boolean, nomFiltre: string }) {
  }

  ngOnInit(): void {
  }

  // Ferme la fenetre de dialogue
  close(): void {
    const predicate: (geste: SequencesTab) => boolean = this.createFilters();
    this.dialogRef.close({filter: predicate, nomFiltre: this.nomFiltreInput.nativeElement.value});
  }

  // Cree un filtre a partir des singleFiltres
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

  // Ajoute un component filtre
  addSingleFilter(): void {
    this.filters.push(false);
  }

  // Met a jour le nom du filtre en fonction des singleFiltres fils
  majNameFilter(): void {
    let name = '';
    let i = 0;
    for (const child of this.childrenFilters) {
      name += child.nameSingleFilter;
      if (i !== this.childrenFilters.length) {
        name += ' ';
      }
      i++;
    }
    this.nameFilter = name;
  }

  sequencesFilterCalled() {
    if(this.childrenFilters==undefined || this.childrenFilters.get(this.childrenFilters.length-1) ==undefined)
      return
    let text:string = this.sequencesNames.nativeElement.value;
    let seqs = text.split(",");
    for (let i = 0; i < seqs.length; i++) {
      this.addSingleFilter();
      let j = i;
      setTimeout(() => {
        // @ts-ignore
        this.childrenFilters.get(j).majNameSingleFilterCustom("id","contient",seqs[i])
      }, 50);

    }
  }
}
