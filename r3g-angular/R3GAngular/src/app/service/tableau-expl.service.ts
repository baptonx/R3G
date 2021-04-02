import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {BehaviorSubject} from 'rxjs';

export interface sequencesTab {
  id: string;
  selected: boolean;
  [key: string]: any;
}
export class sequenceTabImpl implements sequencesTab{
  [key: string]: any;
  selected: boolean = false;
  id: string;

  constructor(ident: string, metadonnees: object) {
    this.id = ident;
    for (const [k, value] of Object.entries(metadonnees)){
      this[k] = value;
    }
  }
  push(k: string, v: any): void{
    this[k] = v;
  }
  concat(seq: sequencesTab){
    for(let [k,v] of Object.entries(seq)){
      this[k] = v;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableauExplService {
  //sequences a afficher (format lineaire)
  sequences: Array<sequencesTab>;
  observableSequences: BehaviorSubject<sequencesTab[]>;
  displayedColumns: string[] = new Array<string>();
  observableColumns: BehaviorSubject<string[]>;
  constructor() {
    this.sequences = new Array<sequencesTab>();
    this.observableSequences = new BehaviorSubject<sequencesTab[]>(this.sequences);
    this.observableColumns = new BehaviorSubject<string[]>(this.displayedColumns);
  }


  ajouterMetadonnee(fileName: string, prefix:string, metadonnee: object): sequencesTab{
    prefix = prefix === ''?'':prefix+'.';
    let sequenceData = new sequenceTabImpl(fileName,{});
    for(let [key, value] of Object.entries(metadonnee)){
      if(typeof value === "object" && value != null){
        sequenceData.concat(this.ajouterMetadonnee(fileName, prefix+key,value));
      }
      else{
        sequenceData.push(prefix+key, value);
      }
    }
    return sequenceData;
  }

  updateAll(tabSequences: Array<Sequence>): void {
    this.sequences = new Array<sequencesTab>();
    let dataCourante: sequencesTab;
    for(let i=0; i<tabSequences.length; i++){
      dataCourante = this.ajouterMetadonnee(tabSequences[i].id,'',tabSequences[i].metaDonnees);
      if(dataCourante != null) {
        this.sequences.push(dataCourante);
      }
    }
    console.log(this.sequences);
    this.observableSequences.next(this.sequences);
  }
}
