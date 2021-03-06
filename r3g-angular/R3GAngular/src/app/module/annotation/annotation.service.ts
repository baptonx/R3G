import { Injectable } from '@angular/core';
import {AnimationAction} from 'three';
import {EventManager} from '@angular/platform-browser';
import {MatButtonToggle} from '@angular/material/button-toggle';
import {Annotation} from '../../class/commun/annotation/annotation';
import { Sequence } from 'src/app/class/commun/sequence';
import {BddService} from '../../service/bdd.service';
import {MatTableDataSource} from '@angular/material/table';
import {BehaviorSubject} from 'rxjs';


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
  public mouseDownAnnotationMove!: boolean;
  public mouseDownAnnotationRightEdge!: boolean;
  public mouseDownAnnotationLeftEdge!: boolean;
  public buttonModeEditing!: MatButtonToggle;
  public buttonModeAnnotation!: MatButtonToggle;
  public annotationNew!: Annotation;
  public annotationCurrent: Annotation;
  public annotationCurrentIsSelected: boolean;
  public mousePosJustBefore!: number;
  public margeEdgeMouse = 10;
  // public annotationIA: Array<Eval> = [];
  public sequenceCurrent: Sequence | undefined;
  public gesteCouleur: Map<string, string> = new Map<string, string>();
  public tabTimeCurrent!: Array<number>;
  public diffFrameAnnotCursor = 0;

  public classeGeste: Array<string> = [];
  public couleur: Array<string> = [];
  public geste = '';
  public dataSource!: MatTableDataSource<string>;
  public observableData: BehaviorSubject<MatTableDataSource<string>>;

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;

  // Annotation
  public sequenceAnnot!: Sequence;

  constructor(private eventManager: EventManager, public bddService: BddService) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 20;
    this.marge = 25;
    this.cursorSize = 6;
    this.mouseDown = false;
    this.mouseDownCursor = false;
    this.mouseDownAnnotationMove = false;
    this.mouseDownAnnotationRightEdge = false;
    this.mouseDownAnnotationLeftEdge = false;
    this.annotationNew = new Annotation();
    this.annotationCurrent = new Annotation();
    this.annotationCurrentIsSelected = false;
    // this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;
    this.observableData = new BehaviorSubject<MatTableDataSource<string>>(this.dataSource);
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
      // AnnotationVeriteTerrain
      if (this.sequenceCurrent !== undefined) {
        // this.ctx.fillStyle = 'rgba(0,255,0,0.6)';
        for (const annot of this.sequenceCurrent.listAnnotation) {
          const name = annot.classeGeste;
          const pos1 = this.timeToPos(this.convertFrameToTime(annot.f1));
          const pos2 = this.timeToPos(this.convertFrameToTime(annot.f2));
          const color = localStorage.getItem(name);
          if (color !== null && color !== '') {
            this.ctx.fillStyle = color;
          } else {
            this.ctx.fillStyle = 'black';
          }
          this.ctx.fillRect(pos1, 100, pos2 - pos1, 100);
          this.ctx.font = '13px Arial';
          if (color !== null && color !== '') {
            this.ctx.fillStyle = 'black';
          } else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillText(name, pos1 + 5, 150);

          if (annot.pointAction > annot.f1 && annot.pointAction < annot.f2) {
            const posPointAction = this.timeToPos(this.convertFrameToTime(annot.pointAction));
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(posPointAction, 100, 2, 100);
          }
        }
        if (this.annotationCurrentIsSelected === true && this.annotationCurrent.ia === false) {
          const pos1 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f1));
          const pos2 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f2));
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(pos1, 100, pos2 - pos1, 100);
          this.ctx.lineWidth = 1;
        }


        // ======================================================
        // PreviewAnnotationNew
        if (this.mouseDown && this.buttonModeAnnotation.checked === true) {
          this.ctx.fillStyle = 'rgba(0,255,0,0.3)';
          const pos1 = this.timeToPos(this.convertFrameToTime(this.annotationNew.f1));
          const pos2 = this.timeToPos(this.convertFrameToTime(this.annotationNew.f2));
          this.ctx.fillRect(pos1, 100, pos2 - pos1, 100);
        }

        // ======================================================
        // RectAnnotationIA
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillRect(this.margeTimeline, 230, this.unit * this.tempsTotal, 100);

        for (const annot of this.sequenceCurrent.listAnnotationIA) {
          const name = annot.classeGeste;
          const pos1 = this.timeToPos(this.convertFrameToTime(annot.f1));
          const pos2 = this.timeToPos(this.convertFrameToTime(annot.f2));
          const color = localStorage.getItem(name);
          if (color !== null && color !== '') {
            this.ctx.fillStyle = color;
          } else {
            this.ctx.fillStyle = 'black';
          }
          this.ctx.fillRect(pos1, 230, pos2 - pos1, 100);
          this.ctx.font = '13px Arial';
          if (color !== null && color !== '') {
            this.ctx.fillStyle = 'black';
          } else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillText(name, pos1 + 5, 280);

          if (annot.pointAction > annot.f1 && annot.pointAction < annot.f2) {
            const posPointAction = this.timeToPos(this.convertFrameToTime(annot.pointAction));
            this.ctx.fillStyle = 'blue';
            this.ctx.fillRect(posPointAction, 230, 2, 100);
          }
        }
        if (this.annotationCurrentIsSelected === true && this.annotationCurrent.ia === true) {
          const pos1 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f1));
          const pos2 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f2));
          this.ctx.strokeStyle = 'black';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(pos1, 230, pos2 - pos1, 100);
          this.ctx.lineWidth = 1;
        }
      }


      // ======================================================
      // CURSOR
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);

      // ======================================================
      // IndicatorTime
      this.ctx.fillStyle = 'black';
      let pas = 1;
      if (this.tempsTotal > 1000) {
        pas = 500;
      }
      else if (this.tempsTotal > 300) {
        pas = 50;
      }
      else if (this.tempsTotal > 300) {
        pas = 50;
      }
      else if (this.tempsTotal > 200) {
        pas = 25;
      }
      else if (this.tempsTotal > 100) {
        pas = 10;
      }
      else if (this.tempsTotal > 40) {
        pas = 5;
      }
      for (let i = 0; i < this.tempsTotal + 1; i = i + pas) {
        const posIndicatorTime = i * this.unit + this.margeTimeline;
        this.drawLine(posIndicatorTime, 0, posIndicatorTime, this.sizeIndicatorTime);
        this.ctx.font = '10px Arial';
        this.ctx.fillText(i.toString(), posIndicatorTime + 8, 10);
      }

      // ======================================================
      // ActionTime
      this.ctx.font = '16px Arial';
      this.ctx.fillText(Number(this.action.time).toFixed(2).toString(), canvas.width - 60, 40);
      this.ctx.fillText(this.convertTimeToFrame(this.action.time).toString(), canvas.width - 60, 60);
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
    if (this.sequenceCurrent !== undefined) {
      const posX = event.offsetX;
      const posY = event.offsetY;
      this.mouseDown = true;
      if (this.buttonModeEditing.checked === true) {
        const tabIndiceAnnotationVeriteTerrain = this.isInsideAnnotationVeriteTerrain(posX, posY);
        const tabIndiceAnnotationIA = this.isInsideAnnotationIA(posX, posY);

        if (tabIndiceAnnotationVeriteTerrain.length !== 0) {
          this.annotationCurrent = this.sequenceCurrent.listAnnotation[tabIndiceAnnotationVeriteTerrain[0]];
          this.annotationCurrentIsSelected = true;
          this.mouseDownAnnotationMove = true;
          this.diffFrameAnnotCursor = this.convertTimeToFrame(this.posToTime(posX)) - this.annotationCurrent.f1;
        }
        else if (tabIndiceAnnotationIA.length !== 0) {
          this.annotationCurrent = this.sequenceCurrent.listAnnotationIA[tabIndiceAnnotationIA[0]];
          this.annotationCurrentIsSelected = true;
          this.mouseDownAnnotationMove = true;
          this.diffFrameAnnotCursor = this.convertTimeToFrame(this.posToTime(posX)) - this.annotationCurrent.f1;
        }
        else {
          this.annotationCurrent = new Annotation();
          this.annotationCurrentIsSelected = false;
        }

        if (this.annotationCurrent !== undefined && this.mouseOnEdgeRightAnnotationSelected(posX, posY)) {
          this.mouseDownAnnotationRightEdge = true;
        }
        else if (this.annotationCurrent !== undefined && this.mouseOnEdgeLeftAnnotationSelected(posX, posY)) {
          this.mouseDownAnnotationLeftEdge = true;
        }

        if (this.mouseOnCursor(posX)) {
          this.mouseDownCursor = true;
        }
      }
      else if (this.buttonModeAnnotation.checked === true) {
        this.annotationNew.f1 = this.convertTimeToFrame(this.posToTime(posX));
      }
      this.mousePosJustBefore = posX;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.sequenceCurrent !== undefined) {
      const posX = event.offsetX;
      this.mouseDown = false;
      this.mouseDownCursor = false;
      this.mouseDownAnnotationMove = false;
      this.mouseDownAnnotationRightEdge = false;
      this.mouseDownAnnotationLeftEdge = false;
      this.mousePosJustBefore = -1;
      if (this.buttonModeAnnotation.checked === true) {
        this.annotationNew.f2 = this.convertTimeToFrame(this.posToTime(posX));
        this.annotationNew.verifyF1BeforeF2();
        const listeGestesBDD = this.bddService.listGesteBDD.get(this.sequenceCurrent.bdd);
        if (listeGestesBDD !== undefined && listeGestesBDD.length > 0) {
          this.annotationNew.classeGeste = listeGestesBDD[0];
        }
        if (this.classeGeste.length > 0) {
          this.annotationNew.classeGeste = this.classeGeste[0];
        }
        if (this.annotationNew.f1 !== this.annotationNew.f2) {
          this.sequenceCurrent.listAnnotation.push(this.annotationNew);
        }
        this.annotationNew = new Annotation();
      }
      this.sequenceCurrent.trierAnnotation();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.sequenceCurrent !== undefined) {
      const posX = event.offsetX;
      const posY = event.offsetY;
      const newValueTime = this.posToTime(posX);

      if (this.buttonModeEditing.checked === true) {
        if (this.mouseDownAnnotationRightEdge) {
          const newF2 = this.convertTimeToFrame(this.posToTime(posX));
          if (newF2 > this.annotationCurrent.f1 && newF2 <= this.tabTimeCurrent.length) {
            this.annotationCurrent.f2 = newF2;
            if (this.annotationCurrent.pointAction >= this.annotationCurrent.f2) {
              this.annotationCurrent.pointAction = 0;
            }
            this.sequenceCurrent.trierAnnotation();
          }
        }
        else if (this.mouseDownAnnotationLeftEdge) {
          const newF1 = this.convertTimeToFrame(this.posToTime(posX));
          if (newF1 >= 0 && newF1 < this.annotationCurrent.f2) {
            this.annotationCurrent.f1 = newF1;
            if (this.annotationCurrent.pointAction <= this.annotationCurrent.f1) {
              this.annotationCurrent.pointAction = 0;
            }
            this.sequenceCurrent.trierAnnotation();
          }
        }
        // else if (this.mouseDownAnnotationMove && this.mousePosJustBefore !== -1) {
        else if (this.mouseDownAnnotationMove && this.annotationCurrent !== undefined) {
          const newF1 = this.convertTimeToFrame(this.posToTime(posX)) - this.diffFrameAnnotCursor;
          let newPointAction = 0;
          if (this.annotationCurrent.pointAction !== 0) {
            newPointAction = newF1 + (this.annotationCurrent.pointAction - this.annotationCurrent.f1);
          }
          const tailleAnnotationFrame = this.annotationCurrent.f2 - this.annotationCurrent.f1;
          const newF2 = newF1 + tailleAnnotationFrame;
          if (newF1 >= 0 && newF2 <= this.tabTimeCurrent.length) {
            this.annotationCurrent.f1 = newF1;
            this.annotationCurrent.f2 = newF2;
            this.annotationCurrent.pointAction = newPointAction;
            if (this.sequenceCurrent !== undefined) {
              this.sequenceCurrent.trierAnnotation();
            }
          }
        }
        else if (this.mouseDownCursor) {
          if (this.isInsideTimeline(posX)) {
            this.action.time = newValueTime;
          }
        }
      }
      else if (this.buttonModeAnnotation.checked === true) {
        if (newValueTime > 0 && newValueTime < this.tempsTotal) {
          this.action.time = newValueTime;
          this.annotationNew.f2 = this.convertTimeToFrame(this.posToTime(posX));
        }
      }

      this.mousePosJustBefore = posX;
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

  mouseOnEdgeRightAnnotationSelected(posX: number, posY: number): boolean {
    if (this.sequenceCurrent !== undefined) {
      const posT2 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f2));
      if (posX > posT2 - this.margeEdgeMouse && posX < posT2 + this.margeEdgeMouse) {
        return true;
      }
      return false;
    }
    return false;
  }

  mouseOnEdgeLeftAnnotationSelected(posX: number, posY: number): boolean {
    if (this.sequenceCurrent !== undefined) {
      const posT1 = this.timeToPos(this.convertFrameToTime(this.annotationCurrent.f1));
      if (posX > posT1 - this.margeEdgeMouse && posX < posT1 + this.margeEdgeMouse) {
        return true;
      }
      return false;
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
    if (this.sequenceCurrent !== undefined) {
      for (let i = this.sequenceCurrent.listAnnotation.length - 1; i >= 0; i--) {
        const annot = this.sequenceCurrent.listAnnotation[i];
        const annotPos1X = this.timeToPos(this.convertFrameToTime(annot.f1));
        const annotPos2X = this.timeToPos(this.convertFrameToTime(annot.f2));
        if (x >= annotPos1X && x <= annotPos2X && y >= 100 && y <= 200) {
          tab.push(i);
        }
      }
    }
    return tab;
  }

  public isInsideAnnotationIA(x: number, y: number): Array<number> {
    const tab = [];
    if (this.sequenceCurrent !== undefined) {
      for (let i = this.sequenceCurrent.listAnnotationIA.length - 1; i >= 0; i--) {
        const annot = this.sequenceCurrent.listAnnotationIA[i];
        const annotPos1X = this.timeToPos(this.convertFrameToTime(annot.f1));
        const annotPos2X = this.timeToPos(this.convertFrameToTime(annot.f2));
        if (x >= annotPos1X && x <= annotPos2X && y >= 230 && y <= 330) {
          tab.push(i);
        }
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
      return Number(this.tabTimeCurrent[frame].toFixed(2));
    }
    if (frame >= this.tabTimeCurrent.length) {
      return Number(this.tempsTotal.toFixed(2));
    }
    return 0;
  }

  public convertTimeToFrame(time: number): number {
    if (this.tabTimeCurrent !== undefined) {
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
    }
    return 0;
  }

  public updateF1(event: any): void {
    if (this.sequenceCurrent !== undefined) {
      const f1EditText = Number(event.target.value);
      if (f1EditText >= 0 && f1EditText < this.annotationCurrent.f2) {
        this.annotationCurrent.f1 = f1EditText;
        this.sequenceCurrent.trierAnnotation();
        if (this.annotationCurrent.pointAction <= this.annotationCurrent.f1) {
          this.annotationCurrent.pointAction = 0;
        }
      }
    }
  }

  public updateF2(event: any): void {
    if (this.sequenceCurrent !== undefined) {
      const f2EditText = Number(event.target.value);
      if (f2EditText > this.annotationCurrent.f1 && f2EditText <= this.tabTimeCurrent.length) {
        this.annotationCurrent.f2 = f2EditText;
        this.sequenceCurrent.trierAnnotation();
        if (this.annotationCurrent.pointAction >= this.annotationCurrent.f2) {
          this.annotationCurrent.pointAction = 0;
        }
      }
    }
  }

  public updatePointAction(event: any): void {
    if (this.sequenceCurrent !== undefined) {
      const PointActionEditText = Number(event.target.value);
      if (PointActionEditText > this.annotationCurrent.f1 && PointActionEditText < this.annotationCurrent.f2) {
        this.annotationCurrent.pointAction = PointActionEditText;
      }
    }
  }

  public supprimerAnnotationCurrent(): void {
    if (this.sequenceCurrent !== undefined) {
      const index = this.sequenceCurrent.listAnnotation.indexOf(this.annotationCurrent);
      if (index !== -1) {
        this.sequenceCurrent.listAnnotation.splice(index, 1);
        this.sequenceCurrent.trierAnnotation();
        this.initializeAnnotationCurrent();
      }
    }
  }

  public supprimerToutesAnnotations(): void {
    if (this.sequenceCurrent !== undefined) {
      this.sequenceCurrent.listAnnotation = [];
      this.initializeAnnotationCurrent();
    }
  }

  public initializeAnnotationCurrent(): void {
    this.annotationCurrent = new Annotation();
    this.annotationCurrentIsSelected = false;
  }

  public copyListAnnotationIAToSequence(): void {
    if (this.sequenceCurrent !== undefined) {
      this.sequenceCurrent.listAnnotation = [];
      for (const a of this.sequenceCurrent.listAnnotationIA) {
        const newA = new Annotation();
        newA.t1 = a.t1 !== undefined ? a.t1 : 0;
        newA.t2 = a.t2 !== undefined ? a.t2 : 0;
        newA.f1 = a.f1 !== undefined ? a.f1 : 0;
        newA.f2 = a.f2 !== undefined ? a.f2 : 0;
        newA.pointAction = a.pointAction !== undefined ? a.pointAction : 0;
        newA.classeGeste = a.classeGeste !== undefined ? a.classeGeste : '';
        this.sequenceCurrent.listAnnotation.push(newA);
      }
      this.initializeAnnotationCurrent();
    }
  }

  sauvegardeAnnotation(): void{
    this.bddService.sauvegardeAnnot(this.sequenceCurrent);
  }

  initializeClasseGesteEditeur(): void {
    this.classeGeste = [];
    this.couleur = [];
    this.geste = '';
    if (this.sequenceCurrent !== undefined) {
      this.bddService.listGesteBDDAction.forEach((value: string[], key: string) => {
        if (this.sequenceCurrent?.bdd === key) {
          value.forEach(elt => {
            this.classeGeste.push(elt);
          });
        }
      });
    }
    this.classeGeste.forEach(geste => {
      const Col = localStorage.getItem(geste);
      if (Col !== null){  //  it checks values here or not to the variable
        this.couleur.push(Col);
        this.gesteCouleur.set(geste, Col);
      }
      else {
        this.couleur.push('');
      }
    });
    this.dataSource = new MatTableDataSource<string>(this.classeGeste);
    this.observableData.next(this.dataSource);

  }
}
