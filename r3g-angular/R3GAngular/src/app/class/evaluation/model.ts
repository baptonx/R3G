import { Hyperparameter } from './hyperparameter';

export class Model {

    idM: string;
    name: string;
    hyperparam: Array<Hyperparameter>;

    constructor(id: string, name: string, hyperparam: Array<Hyperparameter>){
        this.idM = id;
        this.name = name;
        this.hyperparam = hyperparam;
    }
}
