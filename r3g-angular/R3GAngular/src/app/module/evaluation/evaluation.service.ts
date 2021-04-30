import {Injectable} from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {Annotation} from 'src/app/class/commun/annotation/annotation';
import {Sequence} from 'src/app/class/commun/sequence';
import {Eval} from 'src/app/class/evaluation/eval';
import {AnimationAction} from 'three';


@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  public tempsTotal!: number;
  public sizeIndicatorTime!: number;
  public margeTimeline!: number;
  public marge!: number;
  public unit!: number;
  public action!: AnimationAction;
  public widthCanvas!: number;
  public mouseDownAnnotationRightEdge!: boolean;
  public mouseDownAnnotationLeftEdge!: boolean;
  public annotationCurrent!: Annotation;
  public modelAnnot1: Array<Annotation> = [];
  public modelAnnot2: Array<Annotation> = [];
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public annotationIA: Array<Eval> = [];
  public modelEval1: Set<string> = new Set<string>();
  public modelEval2: Set<string> = new Set<string>();
  public sequenceCurrent!: Sequence;
  public tabTimeCurrent!: Array<number>;
  public veriteTerrain: string[] = [];
  public gesteIA1: string[] = [];
  public gesteIA2: string[] = [];
  public timeline1: string;
  public timeline2: string;


  // Timeline
  public ctx!: CanvasRenderingContext2D | null;
  public pauseAction!: boolean;

  constructor(private eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 20;
    this.marge = 25;
    this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;
    this.modelEval1.add('Vérité terrain');
    this.modelEval2.add('Vérité terrain');
    this.timeline1 = '';
    this.timeline2 = '';
  }

  reset(): void {
    this.timeline1 = '';
    this.timeline2 = '';
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.widthCanvas = this.ctx.canvas.width;
      this.unit = (canvas.width - this.margeTimeline * 2) / this.tempsTotal;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(this.margeTimeline, 230, this.unit * this.tempsTotal, 100);
      this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.ctx.fillRect(this.margeTimeline, 100, this.unit * this.tempsTotal, 100);

      // IndicatorTime
      this.ctx.fillStyle = 'black';
      let pas = 1;
      if (this.tempsTotal > 40) {
        pas = 5;
      }
      for (let i = 0; i < this.tempsTotal + 1; i = i + pas) {
        const posIndicatorTime = i * this.unit + this.margeTimeline;
        this.drawLine(posIndicatorTime, 0, posIndicatorTime, this.sizeIndicatorTime);
        this.ctx.font = '10px Arial';
        this.ctx.fillText(i.toString(), posIndicatorTime + 8, 10);
      }

      this.get_verite();
      this.ctx.font = '12px Arial';


      if (this.timeline1 === 'Vérité terrain') {
        this.draw_tmp(100, 0);
      } else if (this.timeline1.includes('Recouvrement')) {
        this.draw_ia_recouvrement(100, 1);
      } else if (this.timeline1.includes('Classes')) {
        this.draw_tmp(100, 1);

      }
      if (this.timeline2 === 'Vérité terrain') {
        this.draw_tmp(230, 0);
      } else if (this.timeline2.includes('Recouvrement')) {
        this.draw_ia_recouvrement(230, 2);
      } else if (this.timeline2.includes('Classes')) {
        this.draw_tmp(230, 2);

      }
    }
  }

  public draw_tmp(j: number, k: number): void {
    if (this.sequenceCurrent !== undefined) {
      let list = this.sequenceCurrent.listAnnotation;
      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (k === 1 && ev.idModel === this.timeline1.replace('Classes ', '')) {
              this.modelAnnot1 = ev.annotation;
              list = ev.annotation;
            } else if (k === 2 && ev.idModel === this.timeline2.replace('Classes ', '')) {
              this.modelAnnot2 = ev.annotation;
              list = ev.annotation;
            }
          }
        }
      );
      let geste = '';
      list.forEach(an => {
        if (this.ctx !== null && this.ctx !== undefined) {
          const name = an.classeGeste;
          const frame1 = an.f1;
          const frame2 = an.f2;

          const t1 = this.convertFrameToTime(Number(frame1));
          const t2 = this.convertFrameToTime(Number(frame2));
          const color = localStorage.getItem(name);
          if (color != null) {
            this.ctx.fillStyle = color;
          } else {
            this.ctx.fillStyle = 'black';
          }
          this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
          if (color != null) {
            this.ctx.fillStyle = 'black';
          } else {
            this.ctx.fillStyle = 'white';
          }
          if (geste !== name && name !== undefined && k === 0) {
            this.ctx.fillText(name, this.timeToPos(t1) + 5, j + 50);
            geste = name;
          }

        }
      });
    }
  }


  public draw_ia_recouvrement(j: number, k: number): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      this.get_ia(k);
      let tmp = this.gesteIA1;
      if (k === 2) {
        tmp = this.gesteIA2;
      }
      let geste = '';
      let nbCorrect = 0;
      const nbFrame = this.convertTimeToFrame(Number(this.tempsTotal));
      for (let i = 0; i < this.veriteTerrain.length; i++) {
        const t1 = this.convertFrameToTime(Number(i));
        const t2 = this.convertFrameToTime(Number(i + 1));
        if (this.veriteTerrain[i] === tmp[i] && this.veriteTerrain[i] !== undefined) {
          this.ctx.fillStyle = 'green';
          nbCorrect++;
          this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
          this.ctx.fillStyle = 'black';
          if (geste === this.veriteTerrain[i]) {
          } else {
            if (this.veriteTerrain[i] !== undefined) {
              this.ctx.fillText(this.veriteTerrain[i], this.timeToPos(t1) + 5, j);
            }
            geste = this.veriteTerrain[i];
          }
        }
      }

      if (nbCorrect > 0) {
        const pourcentage = (nbCorrect / nbFrame * 100).toFixed(2);
        let nb = 0;
        if (k === 2) {
          nb = this.timeToPos(Number(this.tempsTotal)) / 2;
        }
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText('Taux de recouvrement : ' + pourcentage + '%', nb, 20);
      }
      this.ctx.font = '12px Arial';
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


  public get_ia(i: number): void {
    this.annotationIA.forEach(list => {
      if (list.name === this.sequenceCurrent.id) {
        if (i === 1 && list.idModel === this.timeline1.replace('Recouvrement ', '')) {
          this.gesteIA1 = [];
          list.annotation.forEach(an => {
            for (let j = an.f1; j <= an.f2; j++) {
              this.gesteIA1[j] = an.classeGeste;
            }
          });
        } else if (i === 2 && list.idModel === this.timeline2.replace('Recouvrement ', '')) {
          list.annotation.forEach(an => {
            for (let j = an.f1; j <= an.f2; j++) {
              this.gesteIA2[j] = an.classeGeste;
            }
          });
        }
      }
    });
  }


  public get_verite(): void {
    if (this.sequenceCurrent !== undefined) {
      this.sequenceCurrent.listAnnotation.forEach(an => {
        const name = an.classeGeste;
        const frame1 = an.f1;
        const frame2 = an.f2;
        for (let j = Number(frame1); j <= Number(frame2); j++) {
          this.veriteTerrain[j] = name;
        }

      });
    }
  }


  public convertFrameToTime(frame: number): number {
    if (frame >= 0 && frame < this.tabTimeCurrent.length) {
      if (Number(this.tabTimeCurrent[frame]) === 0 && frame !== 0) {
        return this.tempsTotal;
      }
      return this.tabTimeCurrent[frame];
    }
    if (frame >= this.tabTimeCurrent.length) {
      return this.tempsTotal;
    }
    return 0;
  }

  public convertTimeToFrame(time: number): number {
    if (time >= 0) {
      for (let i = 0; i < this.tabTimeCurrent.length; i++) {
        if (this.tabTimeCurrent[i] >= time) {
          return i;
        }
      }
    }
    return 0;
  }

  public onResize(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      canvas.width = window.innerWidth - this.marge * 2;
      this.draw();
    }
  }


  public posToTime(pos: number): number {
    return (pos - this.margeTimeline) / this.unit;
  }

  public timeToPos(time: number): number {
    return time * this.unit + this.margeTimeline;
  }


}
