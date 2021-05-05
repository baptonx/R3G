import { Injectable } from '@angular/core';
import {EngineExplorationService} from '../component/engine-exploration/engine-exploration.service';
import {BddService} from './bdd.service';

@Injectable({
  providedIn: 'root'
})
export class VisualisationExploService {

  componentHidden: boolean;
  constructor(public bddService: BddService, public engineExplorationService: EngineExplorationService) {
    this.componentHidden = true;
  }

  show(element: any): void {
    if (this.bddService.sequenceCourante !== undefined) {
      this.bddService.sequenceCourante.traceNormal = new Array<Array<Array<number>>>();
    }

    this.bddService.sequenceCourante = this.bddService.chercherSequence(element);
    if (this.bddService.sequenceCourante !== undefined) {
      console.log('sequences trouvees');
      this.bddService.getSingleDonnee(this.bddService.sequenceCourante).add(() => this.showAfterLoad(element));
      // this.sequenceChargees.addToList(seqSelectionee);
      // console.log("added to list");
      // this.componentHidden = false;
    }
  }
  showAfterLoad(element: any): void{
    this.engineExplorationService.refreshInitialize();
    this.engineExplorationService.explorationServ.action.time = Number
    (Number(this.engineExplorationService.explorationServ.
    convertFrameToTime(Number(element['annotation.f1']))).toFixed(2));
    this.engineExplorationService.play();
    this.engineExplorationService.pause();
    // console.log('time : ' + this.engineExplorationService.explorationServ.action.time);
  }

  hide(): void{
    this.componentHidden = true;
  }
}
