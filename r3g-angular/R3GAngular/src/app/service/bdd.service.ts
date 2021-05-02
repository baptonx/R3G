import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {SequencesTab, TableauExplService} from './tableau-expl.service';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Annotation} from '../class/commun/annotation/annotation';
import {NodeCol, NodeColImpl} from '../class/exploration/node-col-impl';


export interface BaseDeDonne {
  BDD: Array<SequenceInterface>;
}

export interface SequenceInterface {
  directives: Array<string>;
  id: string;
  BDD: string;
  format: Map<string, string>;
  annotation: object;
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
  node: NodeCol = new NodeColImpl();
  waitanswer = true;
  inwaiting = 0;
  counter = 0;
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

  txtToInkml(labelsPathDossier: string, dataPathDossier: string, inkmlPathDossier: string, fps: string, pathClass: string ): void{
    this.answerWait();
    const labelsPathDossierStr = [];
    for (let i = 0; i < labelsPathDossier.length; i++){
      labelsPathDossierStr.push(labelsPathDossier.charCodeAt(i));
    }
    const dataPathDossierStr = [];
    for (let i = 0; i < dataPathDossier.length; i++){
      dataPathDossierStr.push(dataPathDossier.charCodeAt(i));
    }
    const inkmlPathDossierStr = [];
    for (let i = 0; i < inkmlPathDossier.length; i++){
      inkmlPathDossierStr.push(inkmlPathDossier.charCodeAt(i));
    }
    const pathClassStr = [];
    for (let i = 0; i < pathClass.length; i++){
      pathClassStr.push(pathClass.charCodeAt(i));
    }
    this.http
      .get<object>(`/models/txtToInkml/${labelsPathDossierStr}/${dataPathDossierStr}/${inkmlPathDossierStr}/${fps}/${pathClassStr}` , {})
      .subscribe(() => {
        this.answerHere();
      });
  }

  addpath(): void{
    this.answerWait();
    this.http
      .get<object>('/models/addBDD' , {})
      .subscribe((returnedData: any) => {
        this.ajoutdb(returnedData);
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
        this.ajoutdb(returnedData);
        this.answerHere();
      });
  }

  inkmlTotxt(bddname: string, txtPathDossier: string): void {
    this.answerWait();
    const str = [];
    for (let i = 0; i < txtPathDossier.length; i++){
      str.push(txtPathDossier.charCodeAt(i));
    }
    this.http
      .get<object>(`/models/inkmlToTxt/${bddname}/${str}` , {})
      .subscribe((returnedData: any) => {
        // this.miseajourdb(returnedData);
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
      .subscribe(() => {
        this.enleverunedb(dbname);
        this.answerHere();
      });
  }

  enleverunedb(dbname: string): void{
    const indexlistdb = this.bddnames.indexOf(dbname, 0);
    if (indexlistdb > -1) {
      this.bddnames.splice(indexlistdb, 1);
    }
    this.mapSequences.delete(dbname);
    this.notifyChangeData();
  }

  ajoutdb(returnedData: any): void{
    if (returnedData !== 'Erreur') {
    const nameBdd = returnedData[0];
    this.listGesteBDD.set(nameBdd, returnedData[1]);
    const listseq = returnedData[2] as Array<SequenceInterface>;
    this.ajoutSequencetobdd(nameBdd, listseq);
    this.notifyChangeData();
    }
  }

  miseajourdb(returnedData: any): void{
    this.listGesteBDD.clear();
    for (const [namebdd, value] of Object.entries((returnedData[0]))) {
      if (Array.isArray(value)){
       this.listGesteBDD.set(namebdd, value);
      }
    }
    for (const [key, dbb] of Object.entries((returnedData[1]))) { // list bdd
      const listseq = dbb as Array<SequenceInterface>;
      this.ajoutSequencetobdd(key, listseq);
    }
    this.notifyChangeData();
  }

  miseajourdbOne(nameBdd: string, returnedData: any): void{
    this.listGesteBDD.set(nameBdd, returnedData[0]);
    const listseq = returnedData[1] as Array<SequenceInterface>;
    this.ajoutSequencetobdd(nameBdd, listseq);
    this.notifyChangeData();
  }

  sauvegardeAnnot(seq: Sequence | undefined): void{
    if (seq !== undefined){
      this.answerWait();
      this.http
        .get<object>(`/models/saveAnnot/${seq.bdd}/${seq.id}/${JSON.stringify(seq.listAnnotation)}` , {})
        .subscribe(() => {
          this.answerHere();
        });
    }
  }
  ajoutSequencetobdd(nameBdd: string, listseq: Array<SequenceInterface>): void{
    const listSequence = new Array<Sequence>();
    for (const seqInterface of listseq) { // list sequence
      const sequence = seqInterface as SequenceInterface;
      const listannot = new Array<Annotation>();
      const listdirective = new Array<string>();
      for (const annotation of Object.values(sequence.annotation)) {
        const annot = new Annotation();
        annot.classeGeste = annotation.type;
        annot.f1 = parseFloat(annotation.start);
        annot.f2 = parseFloat(annotation.end);
        listannot.push(annot);
      }
      for (const directive of Object.values(sequence.directives)){
        listdirective.push(String(directive));
      }
      listSequence.push(new Sequence(sequence.id, sequence.BDD, '', listannot, listdirective, sequence.metadonnees));
    }
    this.mapSequences.set(nameBdd, listSequence);
  }
  notifyChangeData(): void{
    this.getlistdb();
    this.updateFormat();
    this.observableSequences.next(this.mapSequences);
    this.notifyTableauService();
  }


  reloaddb(dbname: string): void{
    this.answerWait();
    this.http
      .get<object>(`/models/reload/${dbname}` , {})
      .subscribe((returnedData: any) => {
        this.miseajourdbOne(dbname, returnedData);
        this.answerHere();
      });
  }
  getDonnee(listSequence: Array<Sequence>): void{
    this.inwaiting = listSequence.length * 2;
    this.counter = this.inwaiting;
    for (const sequence of listSequence){
      this.http
        .get<object>(`/models/getDonnee/${sequence.bdd}/${sequence.id}` , {})
        .subscribe((returnedData: any) => {
          if (sequence !== undefined){
            sequence.traceNormal = (returnedData);
          }
          this.counter--;
          if (this.counter === 0){
            this.inwaiting = 0;
          }
        });
    }
    for (const sequence of listSequence){
      this.http
        .get<object>(`/models/getDonneeVoxel/${sequence.bdd}/${sequence.id}` , {})
        .subscribe((returnedData: any) => {
          if (returnedData !== undefined){
            if (returnedData !== 'NoFileExist'){
              sequence.traceVoxel = (returnedData);
            }
          }
          this.counter--;
          if (this.counter === 0){
            this.inwaiting = 0;
          }
        });
    }

  }

  private updateFormat(): void {
    this.node = new NodeColImpl('root');
    this.node.push(['BDD']);
    this.node.push(['id']);
    for (const listsequence of this.mapSequences.values()) {
      for (const sequence of listsequence) {
        this.ajouterFormat(sequence.metaDonnees, []);
        for (const value of sequence.listAnnotation) {
          if (typeof value === 'object' && value != null) {
            this.node.push(['annotation', 'idGeste']);
            this.ajouterFormat(value, ['annotation']);
          }
        }
        if (sequence.directives.length !== 0) {
          this.node.push(['directives']);
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
        this.node.push(path.slice());
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
          if (seqTab.equalsSeq(seq)) {
            sequencesReturn.push(seq);
            seqTab.selected1 = false;
            seqTab.selected2 = false;
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
