import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";

@Injectable({
  providedIn: 'root'
})
export class SequencesChargeesService {
  sequences: Array<Sequence>;
  constructor() {
    this.sequences = new Array<Sequence>();
    for(let i=1 ; i<20 ; i++){
      this.sequences.push(new Sequence("Sequence"+i));
    }
  }

  deleteSeq(i: number): void{
        this.sequences.splice(i,1);
  }
}
