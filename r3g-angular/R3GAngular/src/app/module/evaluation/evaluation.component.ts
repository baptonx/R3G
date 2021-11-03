import { Component, OnInit } from '@angular/core';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EvaluationService } from './evaluation.service';
import {EngineEvaluationSqueletteService} from '../../component/engine-evaluation-squelette/engine-evaluation-squelette.service';
import {Sequence} from '../../class/commun/sequence';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})

export class EvaluationComponent implements OnInit {
  public lastSeqSquelette: Sequence | undefined;

  public  questionerForm!: FormGroup;
  constructor(public engineSqueletteService: EngineEvaluationSqueletteService, public serviceSequence: SequencesChargeesService,
              public bdd: BddService, public evalServ: EvaluationService) {
    this.evalServ.reset();
    this.evalServ.observableShowSquelette.subscribe(() => {
      this.engineSqueletteService.refreshInitialize();
      this.questionerForm = new FormGroup({
        GT: new FormControl(),
        Repeat: new FormControl(),
        Brutt: new FormControl(),
        BrutSimplified: new FormControl(),
        RejectConf: new FormControl(),
        RejectDist: new FormControl(),
        Result: new FormControl(),
      });
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
    this.evalServ.anyChange=true;
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
    this.evalServ.anyChange=true;
    this.evalServ.draw();
  }

  DefaultTimelines() {
    this.evalServ.anyChange=true;
    if (this.questionerForm===undefined)
      return;
    let vals = [
      'Vérité terrain',
      'Repeat '+this.evalServ.selectedModel,
       'Brutt '+this.evalServ.selectedModel,
      'BrutSimplified '+this.evalServ.selectedModel,
      'RejectConf '+this.evalServ.selectedModel,
      'RejectDist '+this.evalServ.selectedModel,
      'Classes '+this.evalServ.selectedModel,
    ]
    this.questionerForm.setValue({
      GT: vals[0],
      Repeat: vals[1],
      Brutt: vals[2],
      BrutSimplified: vals[3],
      RejectConf: vals[4],
      RejectDist: vals[4],
      Result: vals[5],
    });
    for (let i = 0; i < this.evalServ.timelines.length; i++) {
        this.change_timeline_i(vals[i],i);

    }
  }

  getTime():string {
    try{
      return this.evalServ.action.time.toFixed(2);

    }catch (e:any)
    {
      // console.log("erreur ",e)
      return "0";
    }
  }

  getFrame():number {
    try{
      let time = this.evalServ.action.time;
      return this.evalServ.convertTimeToFrame(time);
    }catch (e:any)
    {
      // console.log("erreur ",e)
      return 0;
    }


  }

  getFrameCuDi() {
    try{
      let time = this.evalServ.action.time;
      let frame = this.evalServ.convertTimeToFrame(time);
      return this.evalServ.convertFrameToFrameCuDi(frame);
    }catch (e:any)
    {
      // console.log("erreur ",e)
      return 0;
    }
  }
}
