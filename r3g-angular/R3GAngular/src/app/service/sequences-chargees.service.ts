import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";

@Injectable({
  providedIn: 'root'
})
export class SequencesChargeesService {
  sequences: Set<Sequence>;
  constructor() {
    this.sequences = new Set<Sequence>();
  }

  addToList(sequences: Sequence[]): void {
    for(let seq of sequences) {
      this.sequences.add(seq);
    }
  }
}
