import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DialogCSVComponent} from '../dialog-csv/dialog-csv.component';


@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})


export class ApprentissageComponent implements OnInit {
  modeles = new FormControl();

  modelesList: string[] = ['Modèle 1','Modèle 2','Modèle 3'];
  constructor(public dialog: MatDialog) { }

  openDialog():void{
    const dialogRef = this.dialog.open(DialogCSVComponent, {
      data: {
        hyperparametersNumber:["modeVox","modeLabel","batchSize","dropoutVal","denseSize","denseDropout",
        "nbFeatureMap","dilatationsRates","treshCudi","toleranceTresholdMoveCuDi","lossWeigthWindow","lossWeigthClass",
         "weigthBGclass","weigthBGreg","nb_epoch","valid_part"],
         hyperparametersNumberVal:["24","0","3","0.6","5","0.4","2","[1,2,4,8,16]","1.0","0.1","0.01","1","0.01","0.01","1","0.2"],
         hyperparametersNumber2:["doGlu","doBatchNormalisation","sideBySide","doMultiStream","doNormKMA","evalPredict","useWo0","trainWithGTReg",
        "doReorientationFor2Sk","maxPoolSpatial"],
        hyperparametersNumberVal2:[ ['true', '1', 't', "doglu"],['true', '1', 't', "doglu"],['true', '1', 't', "dosbs", "sbs", "sidebyside"]
      ,['true', '1', 't'],['true', '1', 't'],['true', '1', 't'],['true', '1', 't'],['true', '1', 't'],['true', '1', 't'],['true', '1', 't'],['true', '1', 't']],
        doList: ['true', '1', 't', "doglu"],
        listBN: ['true', '1', 't', "doglu"],
        sBs:['true', '1', 't', "dosbs", "sbs", "sidebyside"],
        listMS:['true', '1', 't'],
        doNormKMA:['true', '1', 't'],
        evalPredict:['true', '1', 't'],
        useWo0: ['true', '1', 't'],
        trainWithGTReg:['true', '1', 't'],
        doReorientationFor2Sk:['true', '1', 't'],
        maxPoolSpatial: ['true', '1', 't'],
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
    
  }

  ngOnInit(): void {
    
  }

}
export interface DialogData {
  hyperparametersNumber:Array<string>
  hyperparametersNumberVal:Array<string>
  hyperparametersNumber2:Array<string>
  hyperparametersNumberVal2:Array<Array<string>>
  doList: Array<string>
  sBs:Array<string>
  listBN:Array<string>
  listMS:Array<string>
  doNormKMA:Array<string>
  evalPredict:Array<string>
  useWo0:Array<string>
  trainWithGTReg:Array<string>
  doReorientationFor2Sk:Array<string>
  maxPoolSpatial: Array<string>
} 