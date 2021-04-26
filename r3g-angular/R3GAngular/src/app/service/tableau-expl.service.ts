import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {BehaviorSubject} from 'rxjs';

export interface SequencesTab {
  id: string;
  geste?: string;
  selected: boolean;
  [key: string]: any;
  equals(seq: SequencesTab): boolean;
}
export class SequenceTabImpl implements SequencesTab{
  [key: string]: any;
  selected = false;
  id: string;
  geste?: string;

  constructor(ident: string, metadonnees: object) {
    this.id = ident;
    for (const [k, value] of Object.entries(metadonnees)){
      this[k] = value;
    }
  }
  equals(seq: SequencesTab): boolean {
    return this.id === seq.id && this.geste === seq.geste;
  }

  push(k: string, v: any): void{
    this[k] = v;
  }
  concat(seq: SequencesTab): void{
    for (const [key, value] of Object.entries(seq)){
      this[key] = value;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableauExplService {
  // sequences a afficher (format lineaire)
  sequences: Array<SequencesTab>;
  selectionListe: Array<SequencesTab>;
  observableSequences: BehaviorSubject<SequencesTab[]>;
  displayedColumns: string[] = new Array<string>();
  observableColumns: BehaviorSubject<string[]>;
  allAttributes: string[] = [];

  // Filtres
  filtres: Array<(seqtab: SequencesTab) => boolean> = [];
  nomFiltres: string[] = [];
  filteredList: SequencesTab[] = [];
  constructor() {
    this.selectionListe = new Array<SequencesTab>();
    this.sequences = new Array<SequencesTab>();
    this.observableSequences = new BehaviorSubject<SequencesTab[]>(this.filteredList);
    this.observableColumns = new BehaviorSubject<string[]>(this.displayedColumns);
  }


  ajouterMetadonnee(fileName: string, prefix: string, metadonnee: object): SequencesTab{
    prefix = prefix === '' ? '' : prefix + '.';
    const sequenceData = new SequenceTabImpl(fileName, {});
    for (const [key, value] of Object.entries(metadonnee)){
      if (typeof value === 'object' && value != null && key !== 'annotation'){
        sequenceData.concat(this.ajouterMetadonnee(fileName, prefix + key, value));
      }
      else{
        this.addAttribute(prefix + key);
        sequenceData.push(prefix + key, value);
      }
    }
    return sequenceData;
  }

  updateAll(mapSequences: Map<string, Array<Sequence>>): void {
    this.sequences = new Array<SequencesTab>();
    let dataCourante: SequencesTab;
    for ( const tabSequences of mapSequences.values()) {
      for (const sequence of tabSequences) {
        dataCourante = new SequenceTabImpl(sequence.id, {});
        if ('annotation' in sequence.metaDonnees) {
          if (typeof sequence.metaDonnees.annotation === 'object') {
            if (Object.keys(sequence.metaDonnees.annotation).length === 0) {
              dataCourante = this.ajouterMetadonnee(sequence.id, '', sequence.metaDonnees);
              this.sequences.push(dataCourante);
            }
            for (const [key, value] of Object.entries(sequence.metaDonnees.annotation)) {
              dataCourante = new SequenceTabImpl(sequence.id, {});
              dataCourante.concat(this.ajouterMetadonnee(sequence.id, '', sequence.metaDonnees));
              if (typeof value === 'object' && value != null) {
                dataCourante.concat(this.ajouterMetadonnee(sequence.id, 'annotation', {idGeste: key}));
                dataCourante.concat(this.ajouterMetadonnee(sequence.id, 'annotation', value));
              }
              this.sequences.push(dataCourante);
            }
          } else {
            dataCourante = this.ajouterMetadonnee(sequence.id, '', sequence.metaDonnees);
            if (dataCourante != null) {
              this.sequences.push(dataCourante);
            }
          }
        } else {
          dataCourante = this.ajouterMetadonnee(sequence.id, '', sequence.metaDonnees);
          if (dataCourante != null) {
            this.sequences.push(dataCourante);
          }
        }
      }
    }
    this.reloadFiltres();
    this.observableSequences.next(this.filteredList);
  }

  private addAttribute(prefix: string): void {
    let idx = this.allAttributes.findIndex((value) => prefix === value);
    if (idx < 0) {
      idx = this.allAttributes.findIndex((value) => prefix.includes(value));
      if (idx >= 0) {
        this.allAttributes.splice(idx, 1);
      }
      this.allAttributes.push(prefix);
    }
  }

  reloadFiltres(): void {
    this.filteredList = this.sequences;
    for (const filtre of this.filtres) {
      this.filteredList = this.filteredList.filter(geste => filtre(geste));
    }
  }
}
