import { Annotation } from '../commun/annotation/annotation';

export class Eval {

    name: string;
    annotation: Array<Annotation>;
    idModel: string;
    listRepeat: Array<number>;
    brutResultReject: Array<number>;
    brutResultPred: Array<string>;
    dataFiltered: Array<Array<Array<string>>>;
    detailResults: Array<Array<number>>;
    voxels: Array<Array<Array<Array<number>>>>;

    constructor(name: string, annotation: Array<Annotation>, idModel: string,brutResultPred:Array<string>,
                brutResultReject:Array<number>,
                listRepeat:Array<number>,dataFiltered:Array<Array<Array<string>>>,voxels: Array<Array<Array<Array<number>>>>,
                detailResults: Array<Array<number>>){
        this.name = name;
        this.annotation = annotation;
        this.idModel = idModel;
        this.listRepeat = listRepeat
        this.brutResultReject = brutResultReject
        this.name = name
        this.annotation = annotation
        this.idModel = idModel
        this.brutResultPred =brutResultPred
        this.dataFiltered = dataFiltered
        this.voxels = voxels;
        this.detailResults = detailResults;
    }
}
