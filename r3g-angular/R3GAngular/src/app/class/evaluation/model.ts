import { Hyperparameter } from "./hyperparameter";

export class Model {

    _id:string
    name:string
    hyperparam:Array<Hyperparameter>

    constructor(id:string,name:string,hyperparam:Array<Hyperparameter>){
        this._id=id;
        this.name=name;
        this.hyperparam=hyperparam;
    }
}
