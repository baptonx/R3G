import { Injectable } from '@angular/core';
import {EngineExplorationService} from '../component/engine-exploration/engine-exploration.service';
import {BddService} from './bdd.service';
import {Sequence} from '../class/commun/sequence';

@Injectable({
  providedIn: 'root'
})
export class VisualisationExploService {

  componentHidden: boolean;
  constructor(public bddService: BddService, public engineExplorationService: EngineExplorationService) {
    this.componentHidden = true;
  }

  show(element: any): void{
    if (this.bddService.sequenceCourante !== undefined) {
      this.bddService.sequenceCourante.traceNormal = new Array<Array<Array<number>>>();
    }

    this.bddService.sequenceCourante = this.bddService.chercherSequence(element);
    if (this.bddService.sequenceCourante !== undefined) {
      console.log('sequences trouvees');
      this.bddService.getDonnee([this.bddService.sequenceCourante]);
      console.log('getDonnees');
      // this.sequenceChargees.addToList(seqSelectionee);
      // console.log("added to list");
      setTimeout(() => {
        this.engineExplorationService.refreshInitialize();
        // console.log(element['annotation.debut']);
        this.engineExplorationService.explorationServ.action.time = Number(Number(this.engineExplorationService.explorationServ.convertFrameToTime(Number(element['annotation.debut']))).toFixed(2));
        console.log(this.engineExplorationService.explorationServ.action.time );
        this.engineExplorationService.play();
        this.engineExplorationService.pause();
        // console.log('time : ' + this.engineExplorationService.explorationServ.action.time);
      }, 1500);
    }
    // this.componentHidden = false;
  }
  hide(): void{
    this.componentHidden = true;
  }
}
