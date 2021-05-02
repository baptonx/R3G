import { Component, OnInit } from '@angular/core';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EngineService } from '../engine/engine.service';
import {BddService} from '../../service/bdd.service';
import {Model} from '../../class/evaluation/model';
import {HttpClient} from '@angular/common/http';
import {Eval} from '../../class/evaluation/eval';

@Component({
  selector: 'app-sequences-annotation',
  templateUrl: './sequences-annotation.component.html',
  styleUrls: ['./sequences-annotation.component.css']
})
export class SequencesAnnotationComponent implements OnInit {
  isLinear = false;
  modelList: Array<Model> = [];
  modelSelected = '';
  sequencesList: Array<string>;
  constructor(public serviceSequence: SequencesChargeesService, public bdd: BddService, public engineService: EngineService
            , public http: HttpClient) {
    this.sequencesList = [];
    this.serviceSequence.sequences1.forEach(elt => {
      this.sequencesList.push(elt.id);
    });
  }

  ngOnInit(): void {
    this.http.get<Array<Model>>('/models/getModelsNames', {}).subscribe((returnedData: Array<Model>) => this.modelList = returnedData);
  }

  changeModel(value: any): void {
    this.modelList.forEach(elt => {
        if (elt.idM === value) {
          this.modelSelected = elt.idM;
        }
      }
    );
  }

  changeValue(value: any): void{
    this.serviceSequence.sequences1.forEach(seq => {
      if (seq.id === value) {
        console.log(seq);
        this.engineService.refreshInitialize(seq);
        // this.bdd.sequenceCourante = seq;
        this.serviceSequence.evaluation.forEach(ev => {
          // if (ev.name === this.bdd.sequenceCourante?.id) {
          if (ev.name === seq.id) {
            this.serviceSequence.evaluatedSelected = ev.annotation;
          }
        });
      }
    });
  }

  eval(): void{
    if (this.modelSelected !== null && this.engineService.annotationServ.sequenceCurrent !== undefined){
      console.log('Evaluation en cours, veuillez patienter.');
      const arraySequence: Array<string> = [];
      arraySequence.push(this.engineService.annotationServ.sequenceCurrent.id);
      this.http.get<Array<Eval>>('/models/evaluation/' + this.engineService.annotationServ.sequenceCurrent.bdd + '/' + arraySequence +
        '/' + this.modelSelected).subscribe(
        (returnedData: Array<Eval>) => {
          console.log('Evaluation terminée');
          if (returnedData.length !== 1) {
            console.log('Attention returnedData !== 1, taille : ' + returnedData.length);
          }
          if (returnedData.length > 0) {
            for (const a of returnedData[0].annotation) {
              a.t1 = a.t1 !== undefined ? a.t1 : 0;
              a.t2 = a.t2 !== undefined ? a.t2 : 0;
              a.f1 = a.f1 !== undefined ? a.f1 : 0;
              a.f2 = a.f2 !== undefined ? a.f2 : 0;
              a.pointAction = a.pointAction !== undefined ? a.pointAction : 0;
              a.classeGeste = a.classeGeste !== undefined ? a.classeGeste : '';
              a.ia = true;
            }
            this.engineService.annotationServ.listAnnotationIA = returnedData[0].annotation;
          }
          /*
          this.annot.annotationIA = returnedData;
          this.evalServ.annotationIA = returnedData;
          this.http.get<string>('/models/getGesteZero/' + this.bddSelected).subscribe(
            (returnedData2: string) => {
              this.evalServ.classZero = returnedData2;
            }
          );
          this.evalServ.modelEval1.add('Recouvrement ' + this.model);
          this.evalServ.modelEval1.add('Classes ' + this.model);
          this.evalServ.modelEval2.add('Recouvrement ' + this.model);
          this.evalServ.modelEval2.add('Classes ' + this.model);
          this.evalServ.draw();
           */
        },
        () => {
          console.log('Echec de l\'évaluation');
        });
    }
  }

  copyListAnnotationIAToSequence(): void {
    this.engineService.annotationServ.copyListAnnotationIAToSequence();
  }

}
