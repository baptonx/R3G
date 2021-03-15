import { Hyperparameter } from "./hyperparameter";

export class Model {

    _id:number
    name:string
    hyperparam:Array<Hyperparameter>

    constructor(id:number,name:string,hyperparam:Array<Hyperparameter>){
        this._id=id;
        this.name=name;
        this.hyperparam=hyperparam;
    }
}
