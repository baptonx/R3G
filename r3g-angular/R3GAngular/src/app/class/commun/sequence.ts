export class Sequence {
  id: string;
  bdd: string;
  metaDonnees: object;
  pathVideoRGB: string;
  traceNormal: Array<Array<Array<number>>>;
  traceVoxel: Array<Array<number>>;
  isTrain: boolean;
  isTest: boolean;
  displayedMetadata: Map<string, string>;

  constructor(id: string, bdd: string, pathVideoRGB: string = '', metadonnee: object = {}){
    this.id = id;
    this.bdd = bdd;
    this.pathVideoRGB = pathVideoRGB;
    this.metaDonnees = metadonnee;
    this.traceNormal = new Array<Array<Array<number>>>();
    this.traceVoxel = new Array<Array<number>>();
    this.isTrain = true;
    this.isTest = false;
    this.displayedMetadata = new Map<string, string>();
  }

  setSequenceDonnee(): void {
    //Get serveur local pour recuperer les traces ...
  }

  ajouterMetaDonnees(): void {
  }

  equals(seq: Sequence): boolean{
    return this.id === seq.id;
  }

}
