import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {BddService} from "./bdd.service";
import {Observable, Subject} from "rxjs";

export interface sequencesTab {
  id: string;
  [key: string]: any
}
export class sequenceTabImpl implements sequencesTab{
  [key: string]: any;
  id: string;
  constructor(ident: string, metadonnees: object) {
    this.id = ident;
    for (const [k, value] of Object.entries(metadonnees)){
      this[k] = value;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableauExplService {
  sequences: Array<sequencesTab>;
  private subject = new Subject<any>();
  constructor() {
    this.sequences = new Array<sequencesTab>();
  }

  updateAll(tabSequences: Array<Sequence>): void {
    this.sequences = new Array<sequencesTab>();
    let dataCourante: sequencesTab;
    for(let i=0; i<tabSequences.length; i++){
      // let k = Object.keys(tabSequences[i].metaDonnees)[0];
      // dataCourante = {id: tabSequences[i].id, position:  2};
      // console.log(dataCourante);
      this.sequences.push(new sequenceTabImpl(tabSequences[i].id,tabSequences[i].metaDonnees));
    }
    if(this.sequences.length > 0){
      console.log("must update here");
      this.updateTabComponent();
    }
  }

  updateTabComponent() {
    this.subject.next();
  }

  onMessage(): Observable<any>{
    return this.subject.asObservable();
  }
}
