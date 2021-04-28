import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {BehaviorSubject} from 'rxjs';

export interface SequencesTab {
  BDD: string;
  id: string;
  idGeste?: string;
  selected1: boolean;
  [key: string]: any;
  equals(seq: SequencesTab): boolean;
}
export class SequenceTabImpl implements SequencesTab{
  BDD: string;
  id: string;
  idGeste?: string;
  geste?: string;
  [key: string]: any;
  selected1 = false;

  constructor(ident: string, bdd: string, metadonnees: object) {
    this.BDD = bdd;
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
  selectionListe1: Array<SequencesTab>;
  selectionListe2: Array<SequencesTab>;
  observableSequences: BehaviorSubject<SequencesTab[]>;
  displayedColumns: string[] = new Array<string>();
  observableColumns: BehaviorSubject<string[]>;
  allAttributes: string[] = [];

  // Filtres
  filtres: Array<(seqtab: SequencesTab) => boolean> = [];
  nomFiltres: string[] = [];
  filteredList: SequencesTab[] = [];
  constructor() {
    this.selectionListe1 = new Array<SequencesTab>();
    this.selectionListe2 = new Array<SequencesTab>();
    this.sequences = new Array<SequencesTab>();
    this.observableSequences = new BehaviorSubject<SequencesTab[]>(this.filteredList);
    this.observableColumns = new BehaviorSubject<string[]>(this.displayedColumns);
  }


  ajouterMetadonnee(fileName: string, bdd: string, prefix: string, metadonnee: object): SequencesTab{
    prefix = prefix === '' ? '' : prefix + '.';
    const sequenceData = new SequenceTabImpl(fileName, bdd, {});
    for (const [key, value] of Object.entries(metadonnee)){
      if (typeof value === 'object' && value != null && key !== 'annotation'){
        sequenceData.concat(this.ajouterMetadonnee(fileName, bdd, prefix + key, value));
      }
      else{
        this.addAttribute(prefix + key);
        sequenceData.push(prefix + key, value);
      }
    }
    return sequenceData;
  }

  updateAll(mapSequences: Map<string, Array<Sequence>>): void {
    this.addAttribute('id');
    this.addAttribute('BDD');
    this.addAttribute('annotation.idGeste');
    this.sequences = new Array<SequencesTab>();
    let dataCourante: SequencesTab;
    for (const bdd of mapSequences.values()) {
      for (const sequence of bdd) {
        if (sequence.listAnnotation.length === 0) {
          dataCourante = new SequenceTabImpl(sequence.id, sequence.bdd, sequence.metaDonnees);
          this.sequences.push(dataCourante);
        } else {
          for (let geste = 0 ; geste < sequence.listAnnotation.length ; geste++) {
            dataCourante = new SequenceTabImpl(sequence.id, sequence.bdd, {});
            dataCourante['annotation.idGeste'] = geste;
            dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, 'annotation', sequence.listAnnotation[geste]));
            dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, '', sequence.metaDonnees));
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
