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
    this.evalServ.onResize();
  }
}
