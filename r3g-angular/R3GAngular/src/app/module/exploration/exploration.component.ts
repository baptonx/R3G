import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})


export class ExplorationComponent implements OnInit {
  selectedSeq: Array<string>//Contient les indices des séquences sélectionnées
  constructor() {
    this.selectedSeq = ['sequence 1', 'sequence 2', 'sequence 3','sequence 4', 'sequence 5', 'sequence 6','sequence 7', 'sequence 8', 'sequence 9',];
  }
  showFiller = false;

  ngOnInit(): void {
  }
  deleteSeq(i: number): void{
    this.selectedSeq.splice(i,1);
  }
}
