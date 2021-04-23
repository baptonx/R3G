import { Injectable } from '@angular/core';
import { Annotation } from '../class/commun/annotation/annotation';
import {Sequence} from "../class/commun/sequence";
import { Eval } from '../class/evaluation/eval';
import {BddService} from './bdd.service';

@Injectable({
  providedIn: 'root'
})
export class SequencesChargeesService {
  sequences: Set<Sequence>;
  evaluation:Array<Eval>
  evaluation_selected:Array<Annotation>
  constructor(public bdd : BddService) {
    this.sequences = new Set<Sequence>();
    this.evaluation = []
    this.evaluation_selected = [];
  
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

  clear() {
    this.sequences.clear();
  }
}
