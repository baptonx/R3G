import { Injectable } from '@angular/core';
import {Sequence} from "../class/commun/sequence";
import {TableauExplService} from "./tableau-expl.service";
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BddService {
  sequences: Sequence[];
  constructor(private http: HttpClient, public tableauExpl: TableauExplService) {
    this.sequences = [
      new Sequence("1","",{position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'}), // Faire une classe séquence
      new Sequence("2","",{position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'}),
      new Sequence("3","",{position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'}),
      new Sequence("4","",{position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'}),
      new Sequence("5","",{position: 5, name: 'Boron', weight: 10.811, symbol: 'B'}),
      new Sequence("6","",{position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'}),
      new Sequence("7","",{position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'}),
      new Sequence("8","",{position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'}),
      new Sequence("9","",{position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'}),
      new Sequence("10","",{position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'}),
      new Sequence("12","",{position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'}),
      new Sequence("13","",{position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'}),
      new Sequence("14","",{position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'}),
      new Sequence("15","",{position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'}),
      new Sequence("16","",{position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'}),
      new Sequence("17","",{position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'}),
      new Sequence("18","",{position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'}),
      new Sequence("19","",{position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'}),
      new Sequence("20","",{position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'}),
      new Sequence("21","",{position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'}),
    ];
    this.notifyTableauService();
  }

  notifyTableauService(): void{
    this.tableauExpl.updateAll(this.sequences);
  }

  setMetaData(): void{

    class MetaDonnees{
      meta_donnees: MetaDonnee[] | undefined;
    }
    class MetaDonnee {
      name: string | undefined;
      formatdonnee: object | undefined;
      meta_Donnee: object | undefined;
    }

    this.http.get<Array<string>>('/models/getMetaDonnee' , {}).subscribe((returnedData: any) => {
      this.sequences = [];
      for (let key in returnedData) {
        console.log(returnedData[key])
        this.sequences.push(new Sequence(key,"",returnedData[key]) );
      }
      this.notifyTableauService();
    });

  }
}
