import { Component, OnInit } from '@angular/core';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';

@Component({
  selector: 'app-sequences-annotation',
  templateUrl: './sequences-annotation.component.html',
  styleUrls: ['./sequences-annotation.component.css']
})
export class SequencesAnnotationComponent implements OnInit {
  sequencesList:Array<String>;
  constructor(public serviceSequence:SequencesChargeesService) { 
    this.sequencesList=[]
    this.serviceSequence.sequences.forEach(elt=>{
      this.sequencesList.push(elt.id)
    })
  }

  ngOnInit(): void {
  }

}
