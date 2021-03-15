import {Component, OnInit, ViewChild} from '@angular/core';
import {SequencesChargeesService} from "../../service/sequences-chargees.service";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-sequences-chargees',
  templateUrl: './sequences-chargees.component.html',
  styleUrls: ['./sequences-chargees.component.css']
})
export class SequencesChargeesComponent implements OnInit {
  @ViewChild('inputFiltre') inputFiltre!: MatInput;
  constructor(public seqChargeesService: SequencesChargeesService) {
  }

  ngOnInit(): void {
  }
}
