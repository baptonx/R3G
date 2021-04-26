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
  public buttonModeAnnotation!: MatButtonToggle;
  public annotationCurrent!: Annotation;
  public allAnnotation: Array<Annotation> = [];
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

      const lengthAnnotation = this.sizeOfAnnotations();

      /*
      if (this.sequenceCurrent !== undefined) {
        console.log(this.sequenceCurrent.metaDonnees.annotation);
      }
       */

      this.ctx.font = '12px Arial';
      for (let i = 1; i < lengthAnnotation; i++) {
        const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
        const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
        const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;
        const t1 = this.convertFrameToTime(Number(frame1));
        const t2 = this.convertFrameToTime(Number(frame2));
        const color = localStorage.getItem(name);
        if (color != null){
          this.ctx.fillStyle = color;
        }
        else {
          this.ctx.fillStyle = 'black';
        }
        this.ctx.fillRect(this.timeToPos(t1), 0, this.timeToPos(t2) - this.timeToPos(t1), 20);
        if (color != null){
          this.ctx.fillStyle = 'black';
        }
        else {
          this.ctx.fillStyle = 'white';
        }
        this.ctx.fillText(name, this.timeToPos(t1) + 5, 13);
      }

      // ======================================================
      // CURSOR
      // console.log('time : ' + this.action.time);
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);


      // ======================================================
      // ActionTime
      this.ctx.font = '15px Arial';
      this.ctx.fillText(Number(this.action.time).toFixed(2).toString(), canvas.width - 30, 25);
    }
  }

  public sizeOfAnnotations(): number {
    let i = 1;

    if (this.sequenceCurrent === undefined) {
      return i;
    }

    while (this.sequenceCurrent.metaDonnees.annotation[i.toString()] !== undefined) {
      i++;
    }
    return i;
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
    //if (this.buttonModeViewing.checked === true) {
    if (true === true) {
      const tabIndiceAnnotation = this.isInsideAnnotationVeriteTerrain(posX, posY);
      if (tabIndiceAnnotation.length !== 0) {
        this.indiceAnnotationSelected = tabIndiceAnnotation[0];
        this.mouseDownAnnotationMove = true;
      }
      else if (tabIndiceAnnotation.length === 0) {
        this.indiceAnnotationSelected = -1;
      }

      if (this.indiceAnnotationSelected !== -1 && this.mouseOnEdgeRightAnnotationSelected(posX, posY)) {
        this.mouseDownAnnotationRightEdge = true;
      }
      else if (this.indiceAnnotationSelected !== -1 && this.mouseOnEdgeLeftAnnotationSelected(posX, posY)) {
        this.mouseDownAnnotationLeftEdge = true;
      }

      if (this.mouseOnCursor(posX)) {
        this.mouseDownCursor = true;
      }
    }
    //else if (this.buttonModeAnnotation.checked === true) {
    else if (true === true) {
      this.annotationCurrent.t1 = this.posToTime(posX);
    }
    this.mousePosJustBefore = posX;
  }

  onMouseUp(event: MouseEvent): void {
    const posX = event.offsetX;
    this.mouseDown = false;
    this.mouseDownCursor = false;
    this.mouseDownAnnotationMove = false;
    this.mouseDownAnnotationRightEdge = false;
    this.mouseDownAnnotationLeftEdge = false;
    this.mousePosJustBefore = -1;
    //if (this.buttonModeAnnotation.checked === true) {
    if (true === true) {
      this.annotationCurrent.t2 = this.posToTime(posX);
      this.annotationCurrent.verifyT1BeforeT2();
      console.log(this.annotationCurrent.t1 + ' - ' + this.annotationCurrent.t2);
      this.allAnnotation.push(this.annotationCurrent);
      this.annotationCurrent = new Annotation();
    }
  }

  onMouseMove(event: MouseEvent): void {
    const posX = event.offsetX;
    const posY = event.offsetY;
    const newValueTime = this.posToTime(posX);

    //if (this.buttonModeViewing.checked === true) {
    if (true === true) {
      if (this.mouseDownAnnotationRightEdge) {
        const timeMouse = this.posToTime(posX);
        const timeMouseJustBefore = this.posToTime(this.mousePosJustBefore);
        const diffTime = timeMouse - timeMouseJustBefore;

        const newT2 = this.allAnnotation[this.indiceAnnotationSelected].t2 + diffTime;
        if (newT2 > this.allAnnotation[this.indiceAnnotationSelected].t1 + 0.05 && newT2 <= this.tempsTotal) {
          this.allAnnotation[this.indiceAnnotationSelected].t2 = newT2;
        }
      }
      else if (this.mouseDownAnnotationLeftEdge) {
        const timeMouse = this.posToTime(posX);
        const timeMouseJustBefore = this.posToTime(this.mousePosJustBefore);
        const diffTime = timeMouse - timeMouseJustBefore;

        const newT1 = this.allAnnotation[this.indiceAnnotationSelected].t1 + diffTime;
        if (newT1 < this.allAnnotation[this.indiceAnnotationSelected].t2 - 0.05 && newT1 >= 0) {
          this.allAnnotation[this.indiceAnnotationSelected].t1 = newT1;
        }
      }
      else if (this.mouseDownAnnotationMove && this.mousePosJustBefore !== -1) {
        const timeMouse = this.posToTime(posX);
        const timeMouseJustBefore = this.posToTime(this.mousePosJustBefore);
        const diffTime = timeMouse - timeMouseJustBefore;

        const newT1 = this.allAnnotation[this.indiceAnnotationSelected].t1 + diffTime;
        const newT2 = this.allAnnotation[this.indiceAnnotationSelected].t2 + diffTime;

        if (newT1 >= 0 && newT2 <= this.tempsTotal) {
          this.allAnnotation[this.indiceAnnotationSelected].t1 = newT1;
          this.allAnnotation[this.indiceAnnotationSelected].t2 = newT2;
        }
      }
      else if (this.mouseDownCursor) {
        if (this.isInsideTimeline(posX)) {
          this.action.time = newValueTime;
        }
      }
    }
    //else if (this.buttonModeAnnotation.checked === true) {
    else if (true === true) {
      if (newValueTime > 0 && newValueTime < this.tempsTotal) {
        this.action.time = newValueTime;
        this.annotationCurrent.t2 = this.posToTime(posX);
      }
    }

    this.mousePosJustBefore = posX;
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

  mouseOnEdgeRightAnnotationSelected(posX: number, posY: number): boolean {
    const posT2 = this.timeToPos(this.allAnnotation[this.indiceAnnotationSelected].t2);
    if (posX > posT2 - this.margeEdgeMouse && posX < posT2 + this.margeEdgeMouse) {
      return true;
    }
    return false;
  }

  mouseOnEdgeLeftAnnotationSelected(posX: number, posY: number): boolean {
    const posT1 = this.timeToPos(this.allAnnotation[this.indiceAnnotationSelected].t1);
    if (posX > posT1 - this.margeEdgeMouse && posX < posT1 + this.margeEdgeMouse) {
      return true;
    }
    return false;
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

  public isInsideAnnotationVeriteTerrain(x: number, y: number): Array<number> {
    const tab = [];
    for (let i = 0; i < this.allAnnotation.length; i++) {
      const annot = this.allAnnotation[i];
      const annotPos1X = this.timeToPos(annot.t1);
      const annotPos2X = this.timeToPos(annot.t2);
      if (x >= annotPos1X && x <= annotPos2X && y >= 100 && y <= 200) {
        tab.push(i);
      }
    }
    return tab;
  }

  public isNumberInArray(tab: Array<number>, y: number): boolean {
    for (const x of tab) {
      if (x === y) {
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
