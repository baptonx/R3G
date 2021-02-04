import { Hyperparameter } from "./hyperparameter";

export class HyperparameterBool extends Hyperparameter {

    value:string[]

    constructor(n:string,v:string[]){
        super(n);
        this.value=v;
    }
}
