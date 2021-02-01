import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DialogCSVComponent} from '../dialog-csv/dialog-csv.component';


@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})


export class ApprentissageComponent implements OnInit, AfterViewInit {
  modeles = new FormControl();

  modelesList: string[] = ['Modèle 1', 'Modèle 2', 'Modèle 3'];
  constructor(public dialog: MatDialog, public http: HttpClient) { }

  openDialog(): void{
    const dialogRef = this.dialog.open(DialogCSVComponent, {
      data: {
        hyperparametersNumber:["modeVox","modeLabel","batchSize","dropoutVal","denseSize","denseDropout",
        "nbFeatureMap","dilatationsRates","treshCudi","toleranceTresholdMoveCuDi","lossWeigthWindow","lossWeigthClass",
         "weigthBGclass","weigthBGreg","nb_epoch","valid_part"],
         hyperparametersNumberVal:["24","0","3","0.6","5","0.4","2","[1,2,4,8,16]","1.0","0.1","0.01","1","0.01","0.01","1","0.2"],
         hyperparametersNumber2:["doGlu","doBatchNormalisation","sideBySide","doMultiStream","doNormKMA","evalPredict","useWo0","trainWithGTReg",
        "doReorientationFor2Sk","maxPoolSpatial"],
        hyperparametersNumberVal2:[ ['true','false'], ['true','false'], ['true','false']
      , ['true','false'], ['true','false'], ['true','false'], ['true','false'], ['true','false'], ['true','false'], ['true','false'], ['true','false']],
      defaultVal:[['true'],['false'],['false'],['false'],['true'],['true'],['false'],['true'],['false'],['true']],
      orderVal:[0,1,2,16,3,17,18,19,4,5,6,7,8,9,20,10,11,21,22,23,12,13,14,15,24,25]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void{
    this.http.get<Array<string>>('/models/getModelsNames' , {}).subscribe((returnedData: any) => this.modelesList = returnedData);
  }

}
export interface DialogData {
  hyperparametersNumber: Array<string>;
  hyperparametersNumberVal: Array<string>;
  hyperparametersNumber2: Array<string>;
  hyperparametersNumberVal2: Array<Array<string>>;
  defaultVal: Array<Array<string>>;
  orderVal: Array<number>;

}
