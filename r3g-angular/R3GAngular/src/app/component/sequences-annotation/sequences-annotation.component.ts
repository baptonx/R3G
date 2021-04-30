import { Component, OnInit } from '@angular/core';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EngineService } from '../engine/engine.service';
import {BddService} from '../../service/bdd.service';
import {Model} from '../../class/evaluation/model';
import {HttpClient} from '@angular/common/http';

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

  ngOnInit(): void {
    this.http.get<Array<Model>>('/models/getModelsNames', {}).subscribe((returnedData: Array<Model>) => this.modelList = returnedData);
  }

  copyListAnnotationIAToSequence(): void {
    this.engineService.annotationServ.copyListAnnotationIAToSequence();
  }

}
