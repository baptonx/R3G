import { Component, OnInit } from '@angular/core';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EngineService } from '../engine/engine.service';
import {BddService} from '../../service/bdd.service';

@Component({
  selector: 'app-sequences-annotation',
  templateUrl: './sequences-annotation.component.html',
  styleUrls: ['./sequences-annotation.component.css']
})
export class SequencesAnnotationComponent implements OnInit {
  sequencesList:Array<String>;
  constructor(public serviceSequence: SequencesChargeesService, public bdd: BddService, public engineService: EngineService) {
    this.sequencesList=[]
    this.serviceSequence.sequences.forEach(elt=>{
      this.sequencesList.push(elt.id)
    })
  }

  changeValue(value: any): void{
    this.serviceSequence.sequences.forEach(seq => {
      if (seq.id === value) {
        this.engineService.refreshInitialize(seq);
        this.bdd.sequenceCourante = seq;
        this.serviceSequence.evaluation.forEach(ev => {
          if (ev.name === this.bdd.sequenceCourante?.id) {
            this.serviceSequence.evaluation_selected = ev.annotation;
          }
        });
      }
    });
  }

  ngOnInit(): void {
  }

}
