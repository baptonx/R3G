import { Component, OnInit } from '@angular/core';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EngineService } from '../engine/engine.service';

@Component({
  selector: 'app-sequences-annotation',
  templateUrl: './sequences-annotation.component.html',
  styleUrls: ['./sequences-annotation.component.css']
})
export class SequencesAnnotationComponent implements OnInit {
  sequencesList:Array<String>;
  constructor(public serviceSequence:SequencesChargeesService, public bdd:BddService) { 
    this.sequencesList=[]
    this.serviceSequence.sequences.forEach(elt=>{
      this.sequencesList.push(elt.id)
    })
  }

  changeValue(value:any){
    this.serviceSequence.sequences.forEach(elt=>{
      if(elt.id==value){
          this.bdd.sequenceCourante=elt
          this.serviceSequence.evaluation.forEach(elt=>{
            if(elt.name === this.bdd.sequenceCourante?.id){
                this.serviceSequence.evaluation_selected = elt.annotation
            }
          })
      }
 
    })
  }

  ngOnInit(): void {
  }

}
