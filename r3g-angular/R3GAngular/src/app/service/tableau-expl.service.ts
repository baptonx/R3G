import { Injectable } from '@angular/core';
import {Sequence} from '../class/commun/sequence';
import {BehaviorSubject} from 'rxjs';

// Sequences a afficher dans le tableau. Une sequencesTab equivaut a une ligne et un attribut de sequencesTab a une colonne.
export interface SequencesTab {
  BDD: string;
  id: string;
  idGeste?: string;
  selected1: boolean;
  selected2: boolean;
  [key: string]: any;
  equals(seq: SequencesTab): boolean;
  equalsSeq(seq: Sequence): boolean;
}
export class SequenceTabImpl implements SequencesTab{
  BDD: string;
  id: string;
  idGeste?: string;
  geste?: string;
  [key: string]: any;
  selected1 = false;
  selected2 = false;

  constructor(ident: string, bdd: string, metadonnees: object) {
    this.BDD = bdd;
    this.id = ident;
    for (const [k, value] of Object.entries(metadonnees)){
      this[k] = value;
    }
  }
  equals(seq: SequencesTab): boolean {
    return this.id === seq.id && this.idGeste === seq.idGeste && seq.BDD === this.BDD;
  }
  equalsSeq(seq: Sequence): boolean {
    return this.id === seq.id && this.BDD === seq.bdd;
  }
  push(k: string, v: any): void{
    this[k] = v;
  }
  concat(seq: SequencesTab): void{
    for (const [key, value] of Object.entries(seq)){
      this[key] = value;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableauExplService {
  // sequencesTab convertis directement depuis le service bdd
  sequences: Array<SequencesTab>;
  observableSequences: BehaviorSubject<SequencesTab[]>;

  // Tableau des sequences selectionnees
  selectionListe1: Array<SequencesTab>;
  selectionListe2: Array<SequencesTab>;

  // colonnes a afficher
  displayedColumns: string[] = new Array<string>();
  observableColumns: BehaviorSubject<string[]>;
  // tous les attributs du tableau de sequencesTab
  allAttributes: string[] = [];

  // mode de selection a une ou deux colonnes
  modeSelection = 'annotation';

  // Filtres
  // filtres est un tableau de filtres (fonction qui renvoient un booleen)
  filtres: Array<(seqtab: SequencesTab) => boolean> = [];
  // nomFiltre est le tableau indiquant le nom du filtre dans le tableau "filtres" au meme indice
  nomFiltres: string[] = [];
  // filteredList est la liste ne contenant que les sequences filtrees.
  filteredList: SequencesTab[] = [];

  constructor() {
    this.selectionListe1 = new Array<SequencesTab>();
    this.selectionListe2 = new Array<SequencesTab>();
    this.sequences = new Array<SequencesTab>();
    this.observableSequences = new BehaviorSubject<SequencesTab[]>(this.filteredList);
    this.observableColumns = new BehaviorSubject<string[]>(this.displayedColumns);
  }

  // methode recursive appelee dans updateAll pour creer un objet SequenceTab a partir d'un id (filename), d'une base de
  // donnees (bdd), d'un prefix utilise pour tous les attributs de la sequencesTab et d'un dictionnaire de donnees.
  private ajouterMetadonnee(fileName: string, bdd: string, prefix: string, metadonnee: object): SequencesTab{
    prefix = prefix === '' ? '' : prefix + '.';
    const sequenceData = new SequenceTabImpl(fileName, bdd, {});
    for (const [key, value] of Object.entries(metadonnee)){
      if (typeof value === 'object' && value != null && key !== 'annotation'){
        sequenceData.concat(this.ajouterMetadonnee(fileName, bdd, prefix + key, value));
      }
      else{
        this.addAttribute(prefix + key);
        sequenceData.push(prefix + key, value);
      }
    }
    return sequenceData;
  }

  // met a jour la liste this.sequences de sequencesTab en convertissant les listes de Sequence passees en parametre.
  updateAll(mapSequences: Map<string, Array<Sequence>>): void {
    this.addAttribute('id');
    this.addAttribute('BDD');
    this.addAttribute('annotation.idGeste');
    this.sequences = new Array<SequencesTab>();
    let dataCourante: SequencesTab;
    for (const bdd of mapSequences.values()) {
      for (const sequence of bdd) {
        if (sequence.listAnnotation.length === 0) {
          dataCourante = this.ajouterMetadonnee(sequence.id, sequence.bdd, '', sequence.metaDonnees);
          if (sequence.directives.length !== 0) {
            dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, '',
              {directives: sequence.directives.join(', ')}));
          }
          this.sequences.push(dataCourante);
        } else {
          for (let geste = 0 ; geste < sequence.listAnnotation.length ; geste++) {
            dataCourante = new SequenceTabImpl(sequence.id, sequence.bdd, {});
            dataCourante['annotation.idGeste'] = geste;
            dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, 'annotation', sequence.listAnnotation[geste]));
            dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, '', sequence.metaDonnees));
            if (sequence.directives.length !== 0) {
              dataCourante.concat(this.ajouterMetadonnee(sequence.id, sequence.bdd, '',
                {directives: sequence.directives.join(', ')}));
            }
            this.sequences.push(dataCourante);
          }
        }
      }
    }
    this.reloadFiltres();
    this.observableSequences.next(this.filteredList);
  }

  // Methode utilisee dans updateAll et ajouterMetadonnee pour ajouter un attribut au tableau this.allAttributes,
  // representant tous les attributs du tableau de sequencesTab
  private addAttribute(prefix: string): void {
    let idx = this.allAttributes.findIndex((value) => prefix === value);
    if (idx < 0) {
      idx = this.allAttributes.findIndex((value) => prefix.includes(value));
      if (idx >= 0) {
        this.allAttributes.splice(idx, 1);
      }
      this.allAttributes.push(prefix);
    }
  }

  // Methode pour regenerer la liste filteredList a partir de this sequences
  reloadFiltres(): void {
    this.filteredList = this.sequences;
    for (const filtre of this.filtres) {
      this.filteredList = this.filteredList.filter(geste => filtre(geste));
    }
  }
}
