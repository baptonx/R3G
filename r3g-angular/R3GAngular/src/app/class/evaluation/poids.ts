export class Poids {

  name: string;
  filtre: Array<Array<Array<Array<Array<number>>>>>;
  biais: Array<number>;
  numero: number;

  constructor(name: string, filtre: Array<Array<Array<Array<Array<number>>>>>, biais: Array<number>,
              numero: number){
    this.filtre = filtre;
    this.name = name;
    this.biais = biais;
    this.numero = numero;
  }

}
