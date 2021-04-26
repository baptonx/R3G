import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {SequencesTab, TableauExplService} from './tableau-expl.service';
import {HttpClient} from '@angular/common/http';
import {FormatDonnees} from '../class/exploration/format-donnees';
import {BehaviorSubject} from 'rxjs';
import {Annotation} from '../class/commun/annotation/annotation';



export interface BaseDeDonne {
  BDD: Array<SequenceInterface>;
}

export interface SequenceInterface {
  id: string;
  BDD: string;
  format: Map<string, string>;
  annotation: Array<Annotation>;
  metadonnees: Metadonnee;
}

export interface Metadonnee {
  [metadonnee: string]: string | Metadonnee;
}

@Injectable({
  providedIn: 'root'
})

export class BddService {
  // sequences: Sequence[];
  mapSequences: Map<string, Array<Sequence>> = new Map<string, Array<Sequence>>();
  bddnames: Array<string> = [];
  observableSequences: BehaviorSubject<Map<string, Array<Sequence>>>;
  formatSequence: FormatDonnees = new FormatDonnees();
  waitanswer = true;
  classesGestes: Array<string> = [];
  listGesteBDD: Map<string, Array<string>> = new Map<string, Array<string>>();
  public sequenceCourante: Sequence|undefined;

  constructor(private http: HttpClient, public tableauExpl: TableauExplService) {
   // this.sequences = [];
    this.notifyTableauService();
    this.observableSequences = new BehaviorSubject<Map<string, Array<Sequence>>>(this.mapSequences);
  }

  notifyTableauService(): void{
    this.tableauExpl.updateAll(this.mapSequences);
  }

  getClasses(): void{

  }
  answerWait(): void{
    this.waitanswer = true;
  }
  answerHere(): void{
    this.waitanswer = false;
  }
 setMetaData(): void{
    this.answerWait();
    this.http
      .get<object>('/models/getMetaDonnee' , {})
      .subscribe((returnedData: any) => {
        this.miseajourdb(returnedData);
        this.answerHere();
    });

  }
  addpath(): void{
    this.answerWait();
    this.http
      .get<object>('/models/addBDD' , {})
      .subscribe((returnedData: any) => {
        this.miseajourdb(returnedData);
        this.answerHere();
        console.log(returnedData);
      });
  }
  addpathtxt(): void{
    this.answerWait();
    this.http
      .get<object>('/models/addBDDtxt' , {})
      .subscribe((returnedData: any) => {
        this.miseajourdb(returnedData);
        this.answerHere();
      });
  }
  addbddwithpath(path: string): void{
    this.answerWait();
    const str = [];
    for (let i = 0; i < path.length; i++){
      str.push(path.charCodeAt(i));
    }
    this.http
      .get<object>(`/models/addBDDwithpath/${str}` , {})
      .subscribe((returnedData: any) => {
        this.miseajourdb(returnedData);
        this.answerHere();
      });
  }
  getlistdb(): void{
    this.http
      .get<Array<string>>(`/models/getListBDD` , {})
      .subscribe((returnedData: any) => {
        this.bddnames = returnedData;
        });
  }
  closedb(dbname: string): void{
    this.answerWait();
    this.http
      .get<object>(`/models/closeBDD/${dbname}` , {})
      .subscribe((returnedData: any) => {
        this.getlistdb();
        this.miseajourdb(returnedData);
        this.answerHere();
      });
  }

  miseajourdb(returnedData: any): void{
    this.listGesteBDD.clear();
    for (const [namebdd, value] of Object.entries((returnedData[0]))) {
      if (Array.isArray(value)){
       this.listGesteBDD.set(namebdd, value);
      }
    }
    // this.sequences = [];
    for (const [key, dbb] of Object.entries((returnedData[1]))) { // list bdd
      const listseq = dbb as BaseDeDonne;
      const listSequence = new Array<Sequence>();
      for (const seqInterface of listseq.BDD) { // list sequence
        const sequence = seqInterface as SequenceInterface;
        listSequence.push(new Sequence(sequence.id, sequence.BDD, '', sequence.annotation, sequence.metadonnees));

      }
      this.mapSequences.set(key, listSequence);
    }
    this.getlistdb();
    this.updateFormat();
    this.notifyTableauService();
    // this.observableSequences.next(this.sequences);
  }
  reloaddb(dbname: string): void{
    this.answerWait();
    this.http
      .get<object>(`/models/reload/${dbname}` , {})
      .subscribe((returnedData: any) => {
        this.miseajourdb(returnedData);
        this.answerHere();
      });

  }
  getDonnee(listSequence: Array<Sequence>): void{
    this.answerWait();
    let counter = listSequence.length;
    for (const sequence of listSequence){
      this.http
        .get<object>(`/models/getDonnee/${sequence.bdd}/${sequence.id}` , {})
        .subscribe((returnedData: any) => {
          if (sequence !== undefined){
            sequence.traceNormal = (returnedData);
          }
          counter--;
          if (counter === 0){
            this.answerHere();
          }
        });
    }

  }

  private updateFormat(): void {
    this.formatSequence = new FormatDonnees();
    for (const listsequence of this.mapSequences.values()) {
      for (const sequence of listsequence) {
        this.ajouterFormat(sequence.metaDonnees, []);
        for (const value of Object.values(sequence.metaDonnees.annotation)) {
          if (typeof value === 'object' && value != null) {
            this.formatSequence.add(['annotation', 'idGeste']);
            this.ajouterFormat(value, ['annotation']);
          }
        }
      }
    }
  }

  private ajouterFormat(metaDonnees: object, path: string[]): void {
    for (const [key, value] of Object.entries(metaDonnees)) {
      path.push(key);
      if (typeof value === 'object' && !Array.isArray(value) && value != null && key !== 'annotation') {
        this.ajouterFormat(value, path);
      }
      else{
        this.formatSequence.add(path.slice());
      }
      path.pop();
    }
  }
  chercherSequenceTableau(seqTabTab: SequencesTab[]): Sequence[] {
    const sequencesReturn: Sequence[] = [];
    let seqTab;
    let cpt;
    for (const listseq of this.mapSequences.values()) {
      for (const seq of listseq)
      {
        cpt = 0;
        while (cpt < seqTabTab.length) {
          seqTab = seqTabTab[cpt];
          if (seq.id === seqTab.id) {
            sequencesReturn.push(seq);
            seqTab.selected = false;
            seqTabTab.splice(cpt, 1);
          } else {
            cpt++;
          }
        }
      }
      if (seqTabTab.length === 0) { break; }
    }
    return sequencesReturn;
  }

  chercherSequence(sequenceLigneTableau: SequencesTab): Sequence|undefined {
    for (const listseq of this.mapSequences.values()) {
        for (const seq of listseq){
          if (seq.id === sequenceLigneTableau.id) {
            return seq;
          }
        }
    }
    return undefined;
  }
}
