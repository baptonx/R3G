import { Injectable } from '@angular/core';
import { Annotation } from '../class/commun/annotation/annotation';
import {Sequence} from '../class/commun/sequence';
import { Eval } from '../class/evaluation/eval';
import {BddService} from './bdd.service';

@Injectable({
  providedIn: 'root'
})
export class SequencesChargeesService {
  sequences1: Set<Sequence>;
  sequences2: Set<Sequence>;
  evaluation: Array<Eval>;
  evaluatedSelected: Array<Annotation>;
  mode: string;
  constructor(public bdd: BddService) {
    this.sequences1 = new Set<Sequence>();
    this.sequences2 = new Set<Sequence>();
    this.evaluation = [];
    this.evaluatedSelected = [];
    this.mode = '';
  }

  addToList(selection: string, sequences: Sequence[]): void {
    const listseqs = [];
    for (const seq of sequences) {
      if (!this.getList(selection).has(seq)) {
        listseqs.push(seq);
      }
      this.getList(selection).add(seq);
    }
    console.log(this.getList(selection));
    console.log(listseqs);
    this.bdd.getDonnee(listseqs);
  }
  getList(selection: string): Set<Sequence> {
    if (selection === 'select1') {
      return this.sequences1;
    }
    else {
      return this.sequences2;
    }
  }

  deleteFromList(sequence: Sequence): void {
    sequence.traceNormal = [];
    this.sequences1.delete(sequence);
  }

  clear(): void {
    this.sequences1.clear();
  }
}
