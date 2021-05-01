import {HttpClient} from '@angular/common/http';
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {HyperparameterBool} from 'src/app/class/evaluation/hyperparameter-bool';
import {HyperparameterNumber} from 'src/app/class/evaluation/hyperparameter-number';
import {Model} from 'src/app/class/evaluation/model';
import {DialogCSVComponent} from '../dialog-csv/dialog-csv.component';
import {DialogEvalComponent} from '../dialog-eval/dialog-eval.component';
import {DialogLearningComponent} from '../dialog-learning/dialog-learning.component';
import {EngineEvaluationService} from '../engine-evaluation/engine-evaluation.service';
import {Poids} from '../../class/evaluation/poids';
import {EvaluationService} from '../../module/evaluation/evaluation.service';


@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})


export class ApprentissageComponent implements OnInit, AfterViewInit {
  modeles = new FormControl();
  modelSelected = '';
  modelesList: Array<Model> = [];

  constructor(public dialog: MatDialog, public http: HttpClient, public engineEval: EngineEvaluationService,
              public evall: EvaluationService) {
    this.evall.draw();
  }


  // Séparation des hyperparametres en 2 catégories, ceux qui prennent des valeurs numériques et ceux qui prennent des boolean
  // orderVal pour ordonner les hyperparametres dans le csv, et qu'il match avec le format de william

  changeValue(value: any): void {
    this.engineEval.layerList.clear();
    this.modelesList.forEach(elt => {
        if (elt.idM === value) {
          this.modelSelected = elt.idM;
        }
      }
    );
  }
  openEval(): void {
    this.dialog.open(DialogEvalComponent, {
      data: {
        model: this.modelSelected,
      }
    });
  }

  openLearning(): void {
    this.dialog.open(DialogLearningComponent, {
      autoFocus: false,
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogCSVComponent, {
      data: {
        hyperparametersNumber: [new HyperparameterNumber('modeVox', '24'),
          new HyperparameterNumber('modeLabel', '0'), new HyperparameterNumber('batchSize', '3'),
          new HyperparameterNumber('dropoutVal', '0.6'), new HyperparameterNumber('denseSize', '5'),
          new HyperparameterNumber('denseDropout', '0.4'), new HyperparameterNumber('nbFeatureMap', '2'),
          new HyperparameterNumber('dilatationRates', '[1,2,4,8,16]'), new HyperparameterNumber('treshCude', '1.0'),
          new HyperparameterNumber('toleranceTresholdMoveCuDi', '0.1'), new HyperparameterNumber('lossWeigthWindow', '0.01'),
          new HyperparameterNumber('lossWeigthClass', '1'), new HyperparameterNumber('weigthBGclass', '0.01'),
          new HyperparameterNumber('weigthBGreg', '0.01'), new HyperparameterNumber('nb_epoch', '1'),
          new HyperparameterNumber('valid_part', '0.2')],
        hyperparametersBool: [new HyperparameterBool('doGlu', ['true']), new HyperparameterBool('doBatchNormalisation', ['false']),
          new HyperparameterBool('sideBySide', ['false']), new HyperparameterBool('doMultiStream', ['false']),
          new HyperparameterBool('doNormKMA', ['true']), new HyperparameterBool('evalPredict', ['true']),
          new HyperparameterBool('useWo0', ['false']), new HyperparameterBool('trainWithGTReg', ['true']),
          new HyperparameterBool('doReorientationFor2Sk', ['false']), new HyperparameterBool('maxPoolSpatial', ['true'])],

        orderVal: [0, 1, 2, 16, 3, 17, 18, 19, 4, 5, 6, 7, 8, 9, 20, 10, 11, 21, 22, 23, 12, 13, 14, 15, 24, 25]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      console.log(this.modelesList);
    });
  }

  ngOnInit(): void {
    this.http.get<Array<Model>>('/models/getModelsNames', {}).subscribe((returnedData: Array<Model>) => {
      this.modelesList = returnedData;
      this.engineEval.modelesList = returnedData;
    });
    console.log(this.modelesList);
  }

  ngAfterViewInit(): void {


  }

}

export interface DialogData {
  hyperparametersNumber: Array<HyperparameterNumber>;
  hyperparametersBool: Array<HyperparameterBool>;
  orderVal: Array<number>;

}

export interface DialogData2 {
  model: string;
  sequences: Array<string>;
}
