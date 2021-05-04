import { Injectable } from '@angular/core';
import {ExplorationService} from '../../module/exploration/exploration.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineExplorationService {

  constructor(public explorationServ: ExplorationService) {
  }

  initialize(c: CanvasRenderingContext2D | null): void {
    this.explorationServ.ctx = c;
    this.explorationServ.onResize();
  }

  onMouseDown(event: MouseEvent): void {
    this.explorationServ.onMouseDown(event);
  }

  onMouseUp(event: MouseEvent): void {
    this.explorationServ.onMouseUp(event);
  }

  onMouseMove(event: MouseEvent): void {
    this.explorationServ.onMouseMove(event);
  }
}
