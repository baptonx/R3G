import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import { Hyperparameter } from 'src/app/class/evaluation/hyperparameter';
import { HyperparameterBool } from 'src/app/class/evaluation/hyperparameter-bool';
import { HyperparameterNumber } from 'src/app/class/evaluation/hyperparameter-number';
import { Model } from 'src/app/class/evaluation/model';
import {DialogCSVComponent} from '../dialog-csv/dialog-csv.component';
import { DialogLearningComponent } from '../dialog-learning/dialog-learning.component';


@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})


export class ApprentissageComponent implements OnInit, AfterViewInit {
  modeles = new FormControl();

  modelesList: Array<Model>=[];
  constructor(public dialog: MatDialog, public http: HttpClient) { }


  // Séparation des hyperparametres en 2 catégories, ceux qui prennent des valeurs numériques et ceux qui prennent des boolean
  // orderVal pour ordonner les hyperparametres dans le csv, et qu'il match avec le format de william

  openLearning():void{
    const DialogRef = this.dialog.open(DialogLearningComponent,{
      data:{}
    })
  }
  openDialog(): void{
    const dialogRef = this.dialog.open(DialogCSVComponent, {
      data: {
        hyperparametersNumber:[new HyperparameterNumber("modeVox","24"),
        new HyperparameterNumber("modeLabel","0"), new HyperparameterNumber("batchSize","3"),
        new HyperparameterNumber("dropoutVal","0.6"), new HyperparameterNumber("denseSize","5"),
        new HyperparameterNumber("denseDropout","0.4"), new HyperparameterNumber("nbFeatureMap","2"),
        new HyperparameterNumber("dilatationRates","[1,2,4,8,16]"),new HyperparameterNumber("treshCude","1.0"),
        new HyperparameterNumber("toleranceTresholdMoveCuDi","0.1"),new HyperparameterNumber("lossWeigthWindow","0.01"),
        new HyperparameterNumber("lossWeigthClass","1"), new HyperparameterNumber("weigthBGclass","0.01"),
        new HyperparameterNumber("weigthBGreg","0.01"), new HyperparameterNumber("nb_epoch","1"),
        new HyperparameterNumber("valid_part","0.2")],
         hyperparametersBool:[new HyperparameterBool("doGlu",["true"]),new HyperparameterBool("doBatchNormalisation",["false"]),
         new HyperparameterBool("sideBySide",["false"]),new HyperparameterBool("doMultiStream",["false"]),
         new HyperparameterBool("doNormKMA",["true"]),new HyperparameterBool("evalPredict",["true"]),
         new HyperparameterBool("useWo0",["false"]),new HyperparameterBool("trainWithGTReg",["true"]),
         new HyperparameterBool("doReorientationFor2Sk",["false"]),new HyperparameterBool("maxPoolSpatial",["true"])],

      orderVal:[0,1,2,16,3,17,18,19,4,5,6,7,8,9,20,10,11,21,22,23,12,13,14,15,24,25]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      console.log(this.modelesList)
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void{
    this.http.get<Array<Model>>('/models/getModelsNames' , {}).subscribe((returnedData: Array<Model>) => this.modelesList = returnedData);

  }

}
export interface DialogData {
  hyperparametersNumber: Array<HyperparameterNumber>;
  hyperparametersBool: Array<HyperparameterBool>;
  orderVal: Array<number>;

}
