import { Component, OnInit } from '@angular/core';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { EngineService } from '../engine/engine.service';

@Component({
  selector: 'app-sequences-annotation',
  templateUrl: './sequences-annotation.component.html',
  styleUrls: ['./sequences-annotation.component.css']
})
export class SequencesAnnotationComponent implements OnInit {
  sequencesList:Array<String>;
  constructor(public serviceSequence:SequencesChargeesService, public engine:EngineService) { 
    this.sequencesList=[]
    this.serviceSequence.sequences.forEach(elt=>{
      this.sequencesList.push(elt.id)
    })
  }

  changeValue(value:any){
    this.serviceSequence.sequences.forEach(elt=>{
      if(elt.id==value){
          this.engine.sequenceCurrent=elt
          console.log(this.engine.sequenceCurrent)
      }
 
    })
  }

  ngOnInit(): void {
  }

}
