import { Injectable } from '@angular/core';
import { EvaluationService } from 'src/app/module/evaluation/evaluation.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineEvaluationService {

  constructor(public evalServ: EvaluationService) {
  }

  initialize(c: CanvasRenderingContext2D | null): void {
    this.evalServ.ctx = c;
    // this.evalServ.onResize();
  }
  onMouseMove($event: MouseEvent): void {
    this.evalServ.onMouseMove($event);
  }

  onWheelMove($event: WheelEvent): void {
    $event.preventDefault();
    this.evalServ.onWheelMove($event);
  }

  onMouseDown(event: MouseEvent): void {
    this.evalServ.onMouseDown(event);
  }

  onMouseUp(event: MouseEvent): void {
    this.evalServ.onMouseUp(event);
  }
}
