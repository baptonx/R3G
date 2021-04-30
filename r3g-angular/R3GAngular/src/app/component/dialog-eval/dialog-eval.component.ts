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
        this.annot.annotationIA = returnedData;
        this.evalServ.annotationIA = returnedData;
        this.evalServ.modelEval1.add('Recouvrement ' + this.model);
        this.evalServ.modelEval1.add('Classes ' + this.model);
        this.evalServ.modelEval2.add('Recouvrement ' + this.model);
        this.evalServ.modelEval2.add('Classes ' + this.model);
        this.evalServ.draw();
      },
      () => {
        this.chargement = 'Echec de l\'évaluation';
    });
    }
}
}
