import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Eval } from 'src/app/class/evaluation/eval';
import { AnnotationService } from 'src/app/module/annotation/annotation.service';
import { EvaluationService } from 'src/app/module/evaluation/evaluation.service';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import {DialogData2 } from '../apprentissage/apprentissage.component';

@Component({
  selector: 'app-dialog-eval',
  templateUrl: './dialog-eval.component.html',
  styleUrls: ['./dialog-eval.component.css']
})
export class DialogEvalComponent implements OnInit {
  model = '';
  chargement = '';
  bddSelected = '';
  sequences: Array<string> = [];
  constructor(public http: HttpClient, public bdd: BddService, public sequencesChargees: SequencesChargeesService,
              public annot: AnnotationService, public evalServ: EvaluationService,
              @Inject(MAT_DIALOG_DATA) public data: DialogData2) {
  this.model = data.model;
  sequencesChargees.sequences1.forEach(elt => {
      this.sequences.push(elt.id);
      this.bddSelected = elt.bdd;
  });
  }

  ngOnInit(): void {
  }

  eval(): void{
    if (this.model !== null){
      this.chargement = 'Evaluation en cours, veuillez patienter.';
      this.http.get<Array<Eval>>('/models/evaluation/' + this.bddSelected + '/' + this.sequences +
    '/' + this.model).subscribe(
      (returnedData: Array<Eval>) => {
        this.chargement = 'Evaluation terminée';
        // this.annot.annotationIA = returnedData;
        returnedData.forEach(ret=>this.evalServ.annotationIA.push(ret));

        this.http.get<string>('/models/getGesteZero/' + this.bddSelected).subscribe(
          (returnedData2: string) => {
            this.evalServ.classZero = returnedData2;
          }
        );
        for (let i=0;i< this.evalServ.modelEval.length;i++) {
            this.evalServ.modelEval[i].add('Recouvrement ' + this.model);
          this.evalServ.modelEval[i].add('Classes ' + this.model);
          this.evalServ.modelEval[i].add('Brutt ' + this.model);
          this.evalServ.modelEval[i].add('BrutSimplified ' + this.model);
          this.evalServ.modelEval[i].add('RejectConf ' + this.model);
          this.evalServ.modelEval[i].add('RejectDist ' + this.model);
          this.evalServ.modelEval[i].add('Repeat ' + this.model);
          this.evalServ.modelEval[i].add('ERDetailed ' + this.model);
          this.evalServ.modelEval[i].add('ERBoundedDetailed ' + this.model);
          this.evalServ.modelEval[i].add('GTCuDi ' + this.model);
          this.evalServ.modelEval[i].add('windowCuDi ' + this.model);
          this.evalServ.modelEval[i].add('windowTemporal ' + this.model);

        }
        this.evalServ.draw();
      },
      () => {
        this.chargement = 'Echec de l\'évaluation';
    });
    }
}
}
