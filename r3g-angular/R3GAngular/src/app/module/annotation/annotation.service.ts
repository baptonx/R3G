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
  public sizeIndicatorTime!: number;
  public margeTimeline!: number;
  public marge!: number;
  public cursorSize!: number;
  public unit!: number;
  public widthCanvas!: number;
  public mouseDown!: boolean;
  public mouseDownCursor!: boolean;

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;

  constructor(private eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 20;
    this.marge = 25;
    this.cursorSize = 6;
    this.mouseDown = false;
    this.mouseDownCursor = false;
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.widthCanvas = this.ctx.canvas.width;
      this.unit = (canvas.width - this.margeTimeline * 2) / this.tempsTotal;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);


      // ======================================================
      // RectAnnotationVeriteTerrain
      this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.ctx.fillRect(this.margeTimeline, 100, this.unit * this.tempsTotal, 100);

      // ======================================================
      // RectAnnotationIA
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(this.margeTimeline, 230, this.unit * this.tempsTotal, 100);

      // ======================================================
      // CURSOR
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);

      // ======================================================
      // IndicatorTime
      this.ctx.fillStyle = 'black';
      for (let i = 0; i < this.tempsTotal + 1; i++) {
        const posIndicatorTime = i * this.unit + this.margeTimeline;
        this.drawLine(posIndicatorTime, 0, posIndicatorTime, this.sizeIndicatorTime);
        this.ctx.font = '10px Arial';
        this.ctx.fillText(i.toString(), posIndicatorTime + 8, 10);
      }

      // ======================================================
      // ActionTime
      this.ctx.font = '20px Arial';
      this.ctx.fillText(this.action.time.toFixed(2).toString(), canvas.width - 80, 30);
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
    const posX = event.offsetX;
    const posY = event.offsetY;
    this.mouseDown = true;
    if (this.mouseOnCursor(posX)) {
      this.mouseDownCursor = true;
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
    this.mouseDownCursor = false;
  }

  onMouseMove(event: MouseEvent): void {
    const posX = event.offsetX;
    if (this.mouseDownCursor && this.isInsideTimeline(posX)) {
      this.action.time = (posX - this.margeTimeline) / this.unit;
    }
  }

  mouseOnCursor(posX: number): boolean {
    const posCursor = this.action.time * this.unit + this.margeTimeline;
    if ((posCursor - this.cursorSize < posX) && (posCursor + this.cursorSize > posX)) {
      return true;
    }
    else {
      return false;
    }
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  public isInsideTimeline(x: number): boolean{
    if (this.ctx !== null && this.ctx !== undefined) {
     if (x > this.margeTimeline && x < this.ctx.canvas.width - this.margeTimeline) {
       return true;
     }
    }
    return false;
  }
}
