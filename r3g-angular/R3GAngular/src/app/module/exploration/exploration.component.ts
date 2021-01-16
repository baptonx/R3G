import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})


export class ExplorationComponent implements OnInit {
  selectedSeq: Array<string>//Contient les indices des séquences sélectionnées
  @ViewChild("inputFiltre") inputFiltre! : MatInput;
  constructor() {
    this.selectedSeq = ['sequence 1', 'sequence 2', 'sequence 3','sequence 4', 'sequence 5', 'sequence 6','sequence 7', 'sequence 8', 'sequence 9', 'sequence 10'];
  }

  ngOnInit(): void {
  }
  deleteSeq(i: number): void{
    this.selectedSeq.splice(i,1);
  }

  predicat(value: string) {
    return value.includes(this.inputFiltre.value);
  }
}
