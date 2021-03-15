import { Injectable } from '@angular/core';
import {AnimationAction} from 'three';
import {EngineService} from '../../component/engine/engine.service';
import {TimelineService} from '../../component/timeline/timeline.service';
import {EventManager} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  public pauseAction!: boolean;
  public tempsTotal!: number;
  public action!: AnimationAction;
  public marge!: number;
  public cursorSize!: number;
  public unit!: number;
  public mouseDown!: boolean;

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;

  constructor(private eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.marge = 25;
    this.cursorSize = 6;
    this.mouseDown = false;
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.unit = (canvas.width - this.cursorSize) / this.tempsTotal;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(this.action.time * this.unit, 0, this.cursorSize, canvas.height);
    }
  }

  public onResize(): void{
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      canvas.width = window.innerWidth - this.marge * 2;
      this.draw();
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseDown = true;
  }

  onMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown) {
      this.action.time = (event.clientX - this.marge) / this.unit;
    }
  }
}
