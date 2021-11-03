import { Annotation } from '../commun/annotation/annotation';

export class Eval {

    name: string;
    annotation: Array<Annotation>;
    idModel: string;
    listRepeat: Array<number>;
    brutResultRejectConfusion: Array<number>;
    brutResultRejectDistance: Array<number>;
    brutResultPred: Array<string>;
    dataFiltered: Array<Array<Array<string>>>;
    detailResults: Array<Array<number>>;
    voxels: Array<Array<Array<Array<number>>>>;
    GTCuDi: Array<string>;
    detailResultsERBounded: Array<number>;
    windowTemporal: Array<number>;
    windowCuDi: Array<number>;

    constructor(name: string, annotation: Array<Annotation>, idModel: string,brutResultPred:Array<string>,
                brutResultRejectConfusion:Array<number>,brutResultRejectDistance:Array<number>,
                listRepeat:Array<number>,dataFiltered:Array<Array<Array<string>>>,voxels: Array<Array<Array<Array<number>>>>,
                detailResults: Array<Array<number>>,GTCuDi:Array<string>,detailResultsERBounded:Array<number>,
                windowTemporal:Array<number>,windowCuDi:Array<number>){
        this.name = name;
        this.annotation = annotation;
        this.idModel = idModel;
        this.listRepeat = listRepeat
        this.brutResultRejectConfusion = brutResultRejectConfusion
        this.brutResultRejectDistance = brutResultRejectDistance
        this.name = name
        this.annotation = annotation
        this.idModel = idModel
        this.brutResultPred =brutResultPred
        this.dataFiltered = dataFiltered
        this.voxels = voxels;
        this.detailResults = detailResults;
        this.GTCuDi = GTCuDi;
        this.detailResultsERBounded = detailResultsERBounded;
        this.windowTemporal = windowTemporal;
        this.windowCuDi = windowCuDi;
    }
}
