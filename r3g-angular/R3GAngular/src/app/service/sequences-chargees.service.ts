import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {BddService} from './bdd.service';

@Injectable({
  providedIn: 'root'
})
export class SequencesChargeesService {
  sequences: Set<Sequence>;
  evaluation:Array<String>;
  constructor(public bdd : BddService) {
    this.sequences = new Set<Sequence>();
    this.evaluation = [];
  }

  addToList(sequences: Sequence[]): void {
    let listseqs = [];
    for(let seq of sequences) {
      if (this.sequences.has(seq)) {
        listseqs.push(seq)
      }
      this.sequences.add(seq);
    }
    this.bdd.getDonnee(listseqs)
  }
  deleteFromList(sequence: Sequence): void {
    sequence.traceNormal = [];
    this.sequences.delete(sequence)
  }
}
