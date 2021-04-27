import { Hyperparameter } from './hyperparameter';

export class HyperparameterNumber extends Hyperparameter {

    value: string;
    constructor(n: string, v: string){
        super(n);
        this.value = v;
    }
}
