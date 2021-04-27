import { Annotation } from '../commun/annotation/annotation';

export class Eval {

    name: string;
    annotation: Array<Annotation>;
    idModel: string;

    constructor(name: string, annotation: Array<Annotation>, idModel: string){
        this.name = name;
        this.annotation = annotation;
        this.idModel = idModel;
    }
}
