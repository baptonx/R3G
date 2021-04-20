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
  allAttributes: string[] = [];

  //Filtres
  filtres: Array<Function> = [];
  filteredList: sequencesTab[] = [];
  constructor() {
    this.sequences = new Array<sequencesTab>();
    this.observableSequences = new BehaviorSubject<sequencesTab[]>(this.sequences);
    this.observableColumns = new BehaviorSubject<string[]>(this.displayedColumns);
  }


  ajouterMetadonnee(fileName: string, prefix:string, metadonnee: object): sequencesTab{
    prefix = prefix === ''?'':prefix+'.';
    let sequenceData = new sequenceTabImpl(fileName,{});
    for(let [key, value] of Object.entries(metadonnee)){
      if(typeof value === "object" && value != null && key !== 'annotation'){
        sequenceData.concat(this.ajouterMetadonnee(fileName, prefix+key,value));
      }
      else{
        this.addAttribute(prefix+key);
        sequenceData.push(prefix+key, value);
      }
    }
    return sequenceData;
  }

  updateAll(tabSequences: Array<Sequence>): void {
    this.sequences = new Array<sequencesTab>();
    let dataCourante: sequencesTab;
    console.log(tabSequences);
    for(let i=0; i<tabSequences.length; i++){
      dataCourante = new sequenceTabImpl(tabSequences[i].id,{});
      if(typeof tabSequences[i].metaDonnees === 'object' && 'annotation' in tabSequences[i].metaDonnees) {
        if(typeof tabSequences[i].metaDonnees['annotation'] === 'object') {
          if(Object.keys(tabSequences[i].metaDonnees.annotation).length === 0) {
            dataCourante = this.ajouterMetadonnee(tabSequences[i].id,'',tabSequences[i].metaDonnees);
            if(dataCourante != null) {
              this.sequences.push(dataCourante);
            }
          }
          for(let [key, value] of Object.entries(tabSequences[i].metaDonnees.annotation)) {
             if(typeof value === 'object' && value != null) {
               dataCourante.push(this.ajouterMetadonnee(tabSequences[i].id, 'annotation', value));
             }
             dataCourante.push(this.ajouterMetadonnee(tabSequences[i].id, '',tabSequences[i].metaDonnees));
             if(dataCourante != null) {
               this.sequences.push(dataCourante);
             }
          }
        }
        else {
          dataCourante = this.ajouterMetadonnee(tabSequences[i].id,'',tabSequences[i].metaDonnees);
          if(dataCourante != null) {
            this.sequences.push(dataCourante);
          }
        }
      } else {
        dataCourante = this.ajouterMetadonnee(tabSequences[i].id,'',tabSequences[i].metaDonnees);
        if(dataCourante != null) {
          this.sequences.push(dataCourante);
        }
      }
    }
    console.log(this.sequences);
    console.log(this.sequences[0]);
    console.log(this.allAttributes);
    this.observableSequences.next(this.sequences);
  }

  private addAttribute(prefix: string): void {
    let idx = this.allAttributes.findIndex((value) => prefix === value);
    if(idx < 0) {
      idx = this.allAttributes.findIndex((value) => prefix.includes(value));
      if(idx >= 0) {
        this.allAttributes.splice(idx,1);
      }
      this.allAttributes.push(prefix);
    }
  }
}
