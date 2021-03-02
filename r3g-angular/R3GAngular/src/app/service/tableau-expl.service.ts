import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {BddService} from "./bdd.service";
import {Observable, Subject} from "rxjs";

export interface sequencesTab {
  id: string;
  [key: string]: any;
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
  sequences: Array<sequencesTab>;
  dataExpl : Array<object>;
  private subject = new Subject<any>();
  constructor() {
    this.sequences = new Array<sequencesTab>();
    this.dataExpl = new Array<object>();
  }


  ajouterMetadonnee(fileName: string, prefix:string, metadonnee: object): sequencesTab{
    let sequenceData = new sequenceTabImpl(fileName,{});
    for(let [key, value] of Object.entries(metadonnee)){
      if(typeof value === "object"){
        sequenceData.concat(this.ajouterMetadonnee('', prefix+'.'+key,value));
      }
      else{
        sequenceData.push(key, value);
      }
    }
    return sequenceData;
  }

  updateAll(tabSequences: Array<Sequence>): void {
    this.sequences = new Array<sequencesTab>();
    let dataCourante: sequencesTab;
    for(let i=0; i<tabSequences.length; i++){
      // let k = Object.keys(tabSequences[i].metaDonnees)[0];
      // dataCourante = {id: tabSequences[i].id, position:  2};
      // console.log(dataCourante);
      dataCourante = this.ajouterMetadonnee(tabSequences[i].id,'',tabSequences[i].metaDonnees);
      console.log(dataCourante);
      this.sequences.push(dataCourante);
    }
    if(this.sequences.length > 0){
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
