import {Annotation} from './annotation/annotation';

export class Sequence {
  id: string;
  bdd: string;
  listAnnotation: Array<Annotation> = [];
  directives: Array<string> = [];
  metaDonnees: any;
  pathVideoRGB: string;
  traceNormal: Array<Array<Array<number>>>;
  traceVoxel: Array<Array<number>>;
  isTrain: boolean;
  isTest: boolean;
  displayedMetadata: Map<string, string>;

  constructor(id: string, bdd: string, pathVideoRGB: string = '', listAnnotation: Array<Annotation>,
              directives: Array<string>, metadonnee: object = {}){
    this.id = id;
    this.bdd = bdd;
    this.listAnnotation = listAnnotation;
    this.pathVideoRGB = pathVideoRGB;
    this.metaDonnees = metadonnee;
    this.traceNormal = new Array<Array<Array<number>>>();
    this.traceVoxel = new Array<Array<number>>();
    this.isTrain = true;
    this.isTest = false;
    this.displayedMetadata = new Map<string, string>();
  }


  equals(seq: Sequence): boolean{
    return this.id === seq.id;
  }

  trierAnnotation(): void {
    let isSwapped;
    do {
      isSwapped = false;

      for (let i = 0; i < this.listAnnotation.length - 1; i++) {
        if (this.listAnnotation[i].f1 > this.listAnnotation[i + 1].f1) {
          const tempLeftValue = this.listAnnotation[i];
          this.listAnnotation[i] = this.listAnnotation[i + 1];
          this.listAnnotation[i + 1] = tempLeftValue;
          isSwapped = true;
        }
      }

    } while (isSwapped === true);
  }

}
