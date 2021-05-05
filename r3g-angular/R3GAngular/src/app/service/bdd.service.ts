import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {SequencesTab, TableauExplService} from './tableau-expl.service';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subscription} from 'rxjs';
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
  mapSequences: Map<string, Array<Sequence>> = new Map<string, Array<Sequence>>();
  bddnames: Array<string> = [];
  observableSequences: BehaviorSubject<Map<string, Array<Sequence>>>;
  node: NodeCol = new NodeColImpl();
  waitanswer = true;
  classesGestes: Array<string> = [];
  listGesteBDD: Map<string, Array<string>> = new Map<string, Array<string>>();
  public sequenceCourante: Sequence|undefined;
  listGesteBDDAction: Map<string, Array<string>> = new Map<string, Array<string>>();

  constructor(private http: HttpClient, public tableauExpl: TableauExplService) {
   // this.sequences = [];
    this.notifyTableauService();
    this.observableSequences = new BehaviorSubject<Map<string, Array<Sequence>>>(this.mapSequences);
  }

  notifyTableauService(): void{
    this.tableauExpl.updateAll(this.mapSequences);
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
    if (pathClass.length > 0 && inkmlPathDossier.length > 0 && dataPathDossier.length > 0 && labelsPathDossier.length > 0 ){
      this.answerWait();
      this.http
        .get<object>(`/models/txtToInkml/${labelsPathDossierStr}/${dataPathDossierStr}/${inkmlPathDossierStr}/${fps}/${pathClassStr}` , {})
        .subscribe(() => {
          this.answerHere();
        });
    }else{
      window.alert('informations manquantes');
    }
  }

  addpath(): void{
    this.answerWait();
    this.http
      .get<object>('/models/addBDD' , {})
      .subscribe((returnedData: any) => {
        if (returnedData === 'directory not found'){
          window.alert('dossier non choisi');
        }else{
          this.ajoutdb(returnedData);
        }
        this.answerHere();
      });
  }

  addbddwithpath(path: string): void{
    const str = [];
    for (let i = 0; i < path.length; i++){
      str.push(path.charCodeAt(i));
    }
    if (path.length > 0){
      this.answerWait();
      this.http
        .get<object>(`/models/addBDDwithpath/${str}` , {})
        .subscribe((returnedData: any) => {
          if (returnedData === 'directory not found or empty'){
            window.alert(returnedData);
          }else{
            this.ajoutdb(returnedData);
          }
          this.answerHere();
        });
    }else {
      window.alert('path vide');
    }
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
        window.alert(returnedData);
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
    this.listGesteBDDAction.set(nameBdd, returnedData[2]);
    const listseq = returnedData[3] as Array<SequenceInterface>;
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
    for (const [namebdd, value] of Object.entries((returnedData[1]))) {
      if (Array.isArray(value)){
        this.listGesteBDDAction.set(namebdd, value);
      }
    }
    for (const [key, dbb] of Object.entries((returnedData[2]))) { // list bdd
      const listseq = dbb as Array<SequenceInterface>;
      this.ajoutSequencetobdd(key, listseq);
    }
    this.notifyChangeData();
  }

  miseajourdbOne(nameBdd: string, returnedData: any): void{
    this.listGesteBDD.set(nameBdd, returnedData[0]);
    this.listGesteBDDAction.set(nameBdd, returnedData[1]);
    console.log(this.listGesteBDDAction);
    const listseq = returnedData[2] as Array<SequenceInterface>;
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
  // getDonnee(listSequence: Array<Sequence>): void{
  //   for (const sequence of listSequence){
  //     this.getSingleDonneeVoxel(sequence);
  //   }
  // }
  getSingleDonnee(sequence: Sequence): Subscription {
    return this.http
      .get<object>(`/models/getDonnee/${sequence.bdd}/${sequence.id}` , {})
      .subscribe((returnedData: any) => {
        if (sequence !== undefined){
          sequence.traceNormal = (returnedData);
        }
      });
  }
  getSingleDonneeVoxel(sequence: Sequence): Subscription {
    this.getSingleDonnee(sequence);
    return this.http
      .get<object>(`/models/getDonneeVoxel/${sequence.bdd}/${sequence.id}` , {})
      .subscribe((returnedData: any) => {
        if (returnedData !== undefined){
          if (returnedData !== 'NoFileExist'){
            sequence.traceVoxel = (returnedData);
          }
        }
      });
  }

  // recherche tous les attributs des sequences de geste et les conserve dans l'objet recursif NodeCol
  // (utilise pour le choix des colonnes a afficher)
  private updateFormat(): void {
    const oldNode = this.node;
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
    this.setSelected(oldNode, this.node);
  }
  // Methode qui donne la valeur completed a vrai pour tous les noeuds qui avaient la valeur a vrai
  private setSelected(oldNode: NodeCol, node: NodeCol): void {
    node.completed = oldNode.completed;
    let idxChildNode;
    for (const child of oldNode.children) {
      idxChildNode = node.children.findIndex((n: NodeCol) => n.name === child.name);
      if (idxChildNode >= 0) {
        this.setSelected(child, node.children[idxChildNode]);
      }
    }
  }

  // Lorsqu'on doit ajouter au format des donnees un dictionnaire dont on ne connait pas les cles et la profondeur,
  // on peut utiliser la methode ajouterFormat qui parcours recursivement le dictionnaire et ajoute un a un les attributs.
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
  // convertit le tableau de SequencestTab en tableau de Sequences en les recherchant dans this.sequences.
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

  // recherche une sequence dans les sequences chargees.
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
