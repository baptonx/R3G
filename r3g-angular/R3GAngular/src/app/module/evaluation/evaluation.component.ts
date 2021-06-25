import { Component, OnInit } from '@angular/core';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EvaluationService } from './evaluation.service';
import {EngineEvaluationSqueletteService} from '../../component/engine-evaluation-squelette/engine-evaluation-squelette.service';
import {Sequence} from '../../class/commun/sequence';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})

export class EvaluationComponent implements OnInit {
  public lastSeqSquelette: Sequence | undefined;


  constructor(public engineSqueletteService: EngineEvaluationSqueletteService, public serviceSequence: SequencesChargeesService,
              public bdd: BddService, public evalServ: EvaluationService) {
    this.evalServ.reset();
    this.evalServ.observableShowSquelette.subscribe(() => {
      this.engineSqueletteService.refreshInitialize();
    });
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
    // this.evalServ.modelEval1.delete(value);
  }



  changeValue(seq: Sequence): void {
    this.evalServ.sequenceCurrent = seq;
    if (this.lastSeqSquelette !== undefined) {
      this.serviceSequence.unloadSequence(this.lastSeqSquelette);
    }
    this.bdd.getSingleDonnee(seq).add(() => this.changeAfterLoad(seq));
    this.lastSeqSquelette = seq;
  }
  changeAfterLoad(seq: Sequence): void {
    this.evalServ.sequenceSquelette = seq;
    this.evalServ.tempsTotal = this.getTempsTotal();
    this.evalServ.draw();
    this.serviceSequence.evaluation.forEach(ev => {
      if (ev.name === this.bdd.sequenceCourante?.id) {
        this.serviceSequence.evaluatedSelected = ev.annotation;
      }
    });
    if (this.evalServ.sequenceCurrent !== undefined) {
      this.engineSqueletteService.refreshInitialize();
    }
  }

  change_timeline_i(value: any,i:number): void{
    this.evalServ.timelines[i] = value;
    console.log(this.evalServ);
    this.evalServ.draw();
  }
}
