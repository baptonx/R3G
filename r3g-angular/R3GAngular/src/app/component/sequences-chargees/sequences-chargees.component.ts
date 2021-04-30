import {Component, OnInit, ViewChild} from '@angular/core';
import {SequencesChargeesService} from '../../service/sequences-chargees.service';
import {MatInput} from '@angular/material/input';
import {Sequence} from '../../class/commun/sequence';

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

  supprimerSequenceDejaChargees(set: string): void {
    let sequencesFiltre: Set<Sequence>;
    let sequencesNonFiltre: Set<Sequence>;
    if (set === 'Train') {
      sequencesFiltre = this.seqChargeesService.sequences1;
      sequencesNonFiltre = this.seqChargeesService.sequences2;
    }
    else {
      sequencesFiltre = this.seqChargeesService.sequences2;
      sequencesNonFiltre = this.seqChargeesService.sequences1;
    }
    for (const sequence of sequencesFiltre) {
      if (sequencesNonFiltre.has(sequence)) {
        sequencesFiltre.delete(sequence);
      }
    }
  }
}
