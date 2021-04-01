import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {TableauExplService} from "./tableau-expl.service";
import {HttpClient} from '@angular/common/http';
import {FormatDonnees} from "../class/exploration/format-donnees";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BddService {
  sequences: Sequence[];
  bddnames: Array<string> = [];
  observableSequences: BehaviorSubject<Sequence[]>;
  formatSequence: FormatDonnees = new FormatDonnees();

  waitanswer: boolean = false;
  constructor(private http: HttpClient, public tableauExpl: TableauExplService) {
    this.sequences = [];
    this.notifyTableauService();
    this.observableSequences = new BehaviorSubject<Sequence[]>(this.sequences);
  }

  notifyTableauService(): void{
    //console.log(this.sequences);
    this.tableauExpl.updateAll(this.sequences);
  }
  answerWait(): void{
    this.waitanswer = true;
    console.log(true);
  }
  answerHere(): void{
    this.waitanswer = false;
    console.log(false);
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
  getlistdb(): void{
    this.http
      .get<Array<string>>(`/models/getListBDD` , {})
      .subscribe((returnedData: any) => {
        this.bddnames = returnedData;
        console.log(returnedData);
      });
  }
  closedb(dbname: string): void{
    this.answerWait();
    this.http
      .get<object>(`/models/closeBDD/${dbname}` , {})
      .subscribe((returnedData: any) => {
        this.getlistdb();
        console.log(returnedData);
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
          this.sequences.push(new Sequence(id, '', dbb[key]));
        }
      }
    }
    this.getlistdb();
    this.updateFormat();
    this.notifyTableauService();
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
  getDonnee(listSequenceName: Array<string>){
    for (let sequenceName in listSequenceName){
      this.http
        .get<Array<string>>(`/models/getDonnee/${sequenceName}` , {})
        .subscribe((returnedData: any) => {
          //ret
      });
    }
  }

  private updateFormat() {
    this.formatSequence = new FormatDonnees();
    for(let i=0 ; i<this.sequences.length ; i++) {
      this.ajouterFormat(this.sequences[i].metaDonnees, []);
    }
    console.log(this.formatSequence);
  }

  private ajouterFormat(metaDonnees: object, path: string[]) {
    for(const [key, value] of Object.entries(metaDonnees)) {
      path.push(key);
      if(typeof value === "object" && !Array.isArray(value) && value != null) {
        this.ajouterFormat(value,path);
      }
      else{
        this.formatSequence.add(path.slice());
      }
      path.pop();
    }
  }
}
