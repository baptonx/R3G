import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {sequencesTab, TableauExplService} from "./tableau-expl.service";
import {HttpClient} from '@angular/common/http';
import {FormatDonnees} from "../class/exploration/format-donnees";
import {BehaviorSubject} from "rxjs";
import set = Reflect.set;
import {element} from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class BddService {
  sequences: Sequence[];
  bddnames: Array<string> = [];
  observableSequences: BehaviorSubject<Sequence[]>;
  formatSequence: FormatDonnees = new FormatDonnees();
  waitanswer: boolean = true;
  classesGestes:Array<String>=[];
  public sequenceCourante: Sequence|undefined;

  constructor(private http: HttpClient, public tableauExpl: TableauExplService) {
    this.sequences = [];
    this.notifyTableauService();
    this.observableSequences = new BehaviorSubject<Sequence[]>(this.sequences);
  }

  notifyTableauService(): void{
    this.tableauExpl.updateAll(this.sequences);
  }

  getClasses():void{

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
      });
  }
  addbddwithpath(path: string): void{
    this.answerWait();
    let str = [];
    for(let i = 0; i< path.length; i++){
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
        this.http.get<Array<String>>('/models/getClasses/'+this.bddnames[0],{}).subscribe((returnedData: Array<String>) => this.classesGestes = returnedData);
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

  miseajourdb(returnedData: object): void{
    this.sequences = [];
    for (const dbb of Object.values((returnedData))) {
      if (Array.isArray(dbb)) {
        for(let key in dbb) {
          let id = dbb[key]['id'];
          let bdd = dbb[key]['BDD'];
          this.sequences.push(new Sequence(id, bdd, '', dbb[key]));
        }
      }
    }
    this.getlistdb();
    this.updateFormat();
    this.notifyTableauService();
    console.log(this.sequences);
    this.observableSequences.next(this.sequences);
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
  getDonnee(listSequence: Array<Sequence>){
    this.answerWait();
    let counter = listSequence.length;
    for(let sequence of listSequence){
      this.http
        .get<object>(`/models/getDonnee/${sequence.bdd}/${sequence.id}` , {})
        .subscribe((returnedData: any) => {
          if (sequence != undefined){
            sequence.traceNormal = (returnedData);
          }
          counter--;
          if(counter == 0){
            this.answerHere();
          }
        });
    }

  }

  private updateFormat() {
    this.formatSequence = new FormatDonnees();
    for(let i=0 ; i<this.sequences.length ; i++) {
      this.ajouterFormat(this.sequences[i].metaDonnees, []);
      for(const [key, value] of Object.entries(this.sequences[i].metaDonnees.annotation)) {
        if(typeof value === 'object' && value != null) {
          this.formatSequence.add(['annotation','idGeste']);
          this.ajouterFormat(value, ['annotation']);
        }
      }
    }
  }

  private ajouterFormat(metaDonnees: object, path: string[]) {
    for(const [key, value] of Object.entries(metaDonnees)) {
      path.push(key);
      if(typeof value === "object" && !Array.isArray(value) && value != null && key !== 'annotation') {
        this.ajouterFormat(value,path);
      }
      else{
        this.formatSequence.add(path.slice());
      }
      path.pop();
    }
  }
  chercherSequenceTableau(seqTabTab: sequencesTab[]): Sequence[] {
    let sequencesReturn: Sequence[] = [];
    let seqTab;
    let cpt;
    for(let seq of this.sequences) {
      cpt = 0;
      while(cpt < seqTabTab.length) {
        seqTab = seqTabTab[cpt];
        if(seq.id === seqTab.id) {
          sequencesReturn.push(seq);
          seqTab.selected = false;
          seqTabTab.splice(cpt,1);
        }
        else cpt++;
      }
      if(seqTabTab.length === 0) break;
    }
    return sequencesReturn;
  }

  chercherSequence(sequenceLigneTableau: sequencesTab): Sequence|undefined {
    for (const seq of this.sequences) {
      if (seq.id === sequenceLigneTableau.id) {
        return seq;
      }
    }
    return undefined;
  }
}
