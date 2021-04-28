import { Injectable } from '@angular/core';
import {AnimationAction} from 'three';
import {MatButtonToggle} from '@angular/material/button-toggle';
import {Annotation} from '../../class/commun/annotation/annotation';
import {EventManager} from '@angular/platform-browser';
import {Sequence} from '../../class/commun/sequence';
import {BddService} from '../../service/bdd.service';

@Injectable({
  providedIn: 'root'
})
export class ExplorationService {

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
  public mouseDownAnnotationMove!: boolean;
  public mouseDownAnnotationRightEdge!: boolean;
  public mouseDownAnnotationLeftEdge!: boolean;
  public buttonModeViewing!: MatButtonToggle;
  public annotationCurrent!: Annotation;
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public margeEdgeMouse = 10;
  public sequenceCurrent!: Sequence;
  public tabTimeCurrent!: Array<number>;

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;

  constructor(private eventManager: EventManager, public bddService: BddService) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 40;
    this.marge = 25;
    this.cursorSize = 3;
    this.mouseDown = false;
    this.mouseDownCursor = false;
    this.mouseDownAnnotationMove = false;
    this.mouseDownAnnotationRightEdge = false;
    this.mouseDownAnnotationLeftEdge = false;
    this.annotationCurrent = new Annotation();
    this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.widthCanvas = this.ctx.canvas.width;
      this.unit = (canvas.width - this.margeTimeline * 2) / this.tempsTotal;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.ctx.strokeStyle = 'white';
      this.drawLine(this.margeTimeline, canvas.height / 2, canvas.width - this.margeTimeline, canvas.height / 2);
      this.ctx.strokeStyle = 'black';

      if (this.sequenceCurrent !== undefined) {
        this.ctx.font = '12px Arial';
        for (const annotation of this.sequenceCurrent.listAnnotation) {
          const name = annotation.classeGeste;
          const frame1 = annotation.f1;
          const frame2 = annotation.f2;
          const t1 = this.convertFrameToTime(Number(frame1));
          const t2 = this.convertFrameToTime(Number(frame2));
          const color = localStorage.getItem(name);
          if (color !== null && color !== ' '){
            this.ctx.fillStyle = color;
          }
          else {
            this.ctx.fillStyle = 'black';
          }
          this.ctx.fillRect(this.timeToPos(t1), 0, this.timeToPos(t2) - this.timeToPos(t1), 20);
          if (color !== null && color !== ' '){
            this.ctx.fillStyle = 'black';
          }
          else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillText(name, this.timeToPos(t1) + 5, 13);
        }
      }

      // ======================================================
      // CURSOR
      // console.log('time : ' + this.action.time);
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);


      // ======================================================
      // ActionTime
      this.ctx.font = '13px Arial';
      this.ctx.fillText(Number(this.action.time).toFixed(2).toString(), canvas.width - 40, 33);
    }
  }

  public onResize(): void{
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      canvas.width = window.innerWidth - this.marge * 4;
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
    const posX = event.offsetX;
    this.mouseDown = false;
    this.mouseDownCursor = false;
  }

  onMouseMove(event: MouseEvent): void {
    const posX = event.offsetX;
    const newValueTime = this.posToTime(posX);
    if (this.mouseDownCursor) {
      if (this.isInsideTimeline(posX)) {
        this.action.time = newValueTime;
      }
    }
  }

  mouseOnCursor(posX: number): boolean {
    const posCursor = this.timeToPos(this.action.time);
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

  public posToTime(pos: number): number {
    return (pos - this.margeTimeline) / this.unit;
  }

  public timeToPos(time: number): number {
    return time * this.unit + this.margeTimeline;
  }

  public convertFrameToTime(frame: number): number {
    if (frame >= 0 && frame < this.tabTimeCurrent.length) {
      return this.tabTimeCurrent[frame];
    }
    if (frame >= this.tabTimeCurrent.length) {
      return this.tempsTotal;
    }
    return 0;
  }

  public convertTimeToFrame(time: number): number {
    if (time >= 0 && time < this.tempsTotal) {
      for (let i = 0; i < this.tabTimeCurrent.length; i++) {
        if (this.tabTimeCurrent[i] >= time) {
          return i;
        }
      }
    }
    if (time >= this.tabTimeCurrent[this.tabTimeCurrent.length - 1]) {
      return this.tabTimeCurrent.length - 1;
    }
    return 0;
  }
}
