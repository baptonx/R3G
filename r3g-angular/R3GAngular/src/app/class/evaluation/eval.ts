import { Annotation } from "../commun/annotation/annotation"

export class Eval {

    name:string
    annotation:Array<Annotation>

    constructor(name:string,annotation:Array<Annotation>){
        this.name=name
        this.annotation=annotation
    }
}
