import { Annotation } from "../commun/annotation/annotation"

export class Eval {

    name:string
    annotation:Array<Annotation>
    id_model:string

    constructor(name:string,annotation:Array<Annotation>,id_model:string){
        this.name=name
        this.annotation=annotation
        this.id_model = id_model
    }
}
