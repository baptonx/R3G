import { Injectable } from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {AnnotationService} from '../../module/annotation/annotation.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  constructor(public annotationServ: AnnotationService) {
  }

  initialize(c: CanvasRenderingContext2D | null): void {
    this.annotationServ.ctx = c;
    this.annotationServ.onResize();
  }

  onMouseDown(event: MouseEvent): void {
    this.annotationServ.onMouseDown(event);
  }

  onMouseUp(event: MouseEvent): void {
    this.annotationServ.onMouseUp(event);
  }

  onMouseMove(event: MouseEvent): void {
    this.annotationServ.onMouseMove(event);
  }
}
