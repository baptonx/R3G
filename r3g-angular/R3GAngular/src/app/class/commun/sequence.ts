export class Sequence {
  id: string;
  metaDonnees: Map<string, any>;
  pathVideoRGB: string;
  traceNormal: Array<Array<number>>;
  traceVoxel: Array<Array<number>>;
  isTrain: boolean;
  isTest: boolean;

  constructor(id: string, pathVideoRgb: string = ''){
    this.id = id;
    this.pathVideoRGB = pathVideoRgb;
    this.metaDonnees = new Map();
    this.traceNormal = new Array<Array<number>>();
    this.traceVoxel = new Array<Array<number>>();
    this.isTrain = false;
    this.isTest = false;
  }

  chargerSequence(): void {
    //Get serveur local pour recuperer les traces ...
  }

  ajouterMetaDonnees(): void {

  }


}
