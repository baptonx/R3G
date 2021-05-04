import { Component, OnInit } from '@angular/core';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EvaluationService } from './evaluation.service';
import {EngineEvaluationSqueletteService} from '../../component/engine-evaluation-squelette/engine-evaluation-squelette.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {


  sequencesList: Array<string>;
  constructor(public engineSqueletteService: EngineEvaluationSqueletteService, public serviceSequence: SequencesChargeesService,
              public bdd: BddService, public evalServ: EvaluationService) {
    this.sequencesList = [];
    this.serviceSequence.sequences1.forEach(elt => {
      this.sequencesList.push(elt.id);
    });
    this.evalServ.reset();
  }

  ngOnInit(): void {
  }

  getTempsTotal(): number {
    const tabTime: Array<number> = [];
    for (let i = 0; i < this.evalServ.sequenceCurrent.traceNormal.length; i++) {
      for (const frame of this.evalServ.sequenceCurrent.traceNormal[i]) {
        tabTime.push(frame[3]);
      }

      if (i === 0) {
        this.evalServ.tabTimeCurrent = tabTime;
      }
    }

    return tabTime[tabTime.length - 1];
  }

  delete(value: any): void{
    this.evalServ.modelEval1.delete(value);
  }

  changeValue(value: any): void{
    this.serviceSequence.sequences1.forEach(seq => {
      if (seq.id === value) {
        this.evalServ.sequenceCurrent = seq;
        this.evalServ.tempsTotal = this.getTempsTotal();
        // this.evalServ.onResize.bind(this.evalServ)
        this.evalServ.draw();
        this.serviceSequence.evaluation.forEach(ev => {
          if (ev.name === this.bdd.sequenceCourante?.id) {
            this.serviceSequence.evaluatedSelected = ev.annotation;
          }
        });
      }
    });
    if (this.evalServ.sequenceCurrent !== undefined) {
      this.engineSqueletteService.refreshInitialize();
    }
  }

  change_timeline_1(value: any): void{
    this.evalServ.timeline1 = value;
    console.log(this.evalServ);
    this.evalServ.draw();
  }

  change_timeline_2(value: any): void{
    this.evalServ.timeline2 = value;
    console.log(this.evalServ);
    this.evalServ.draw();
  }

}
