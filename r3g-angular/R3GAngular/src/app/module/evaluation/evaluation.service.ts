import { Injectable } from '@angular/core';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { EventManager } from '@angular/platform-browser';
import { Annotation } from 'src/app/class/commun/annotation/annotation';
import { Sequence } from 'src/app/class/commun/sequence';
import { Eval } from 'src/app/class/evaluation/eval';
import { BddService } from 'src/app/service/bdd.service';


@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  public tempsTotal!: number;
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
  public annotationCurrent!: Annotation;
  public allAnnotation: Array<Annotation> = [];
  public modelAnnot1: Array<Annotation> = [];
  public modelAnnot2: Array<Annotation> = [];
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public margeEdgeMouse = 10;
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

  constructor(private eventManager: EventManager) {
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
    this.annotationCurrent = new Annotation();
    this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;
    this.modelEval1.add('Vérité terrain');
    this.modelEval2.add('Vérité terrain');
    this.timeline1 = '';
    this.timeline2 = '';
  }

  reset(): void{
      this.timeline1 = '';
      this.timeline2 = '';
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


      this.get_verite();
      this.get_annot();
      this.ctx.font = '12px Arial';

      if (this.timeline1 === 'Vérité terrain'){
        this.draw_verite(100);
      }
      else if (this.timeline1.includes('Recouvrement')){
        this.draw_ia_recouvrement(100, 1);
      }
      else if (this.timeline1.includes('Classes')){
        this.draw_ia_classes(100, 1);

      }
      if (this.timeline2 === 'Vérité terrain'){
        this.draw_verite(230);
      }
      else if (this.timeline2.includes('Recouvrement')){
        this.draw_ia_recouvrement(230, 2);
      }
      else if (this.timeline2.includes('Classes')){
        this.draw_ia_classes(230, 2);

      }

      // ======================================================
      // PreviewAnnotationCurrent
      if (this.mouseDown && this.buttonModeAnnotation.checked === true) {
        this.ctx.fillStyle = 'rgba(0,255,0,0.3)';
        const pos1 = this.timeToPos(this.annotationCurrent.t1);
        const pos2 = this.timeToPos(this.annotationCurrent.t2);
        this.ctx.fillRect(pos1, 100, pos2 - pos1, 100);
      }
    }
    }

public draw_ia_classes(j: number, k: number): void{
  if (k === 1){
  this.modelAnnot1 = [];
  this.annotationIA.forEach(list => {
    if (list.name === this.sequenceCurrent.id && list.idModel === this.timeline1.replace('Classes ', '')){
      this.modelAnnot1 = list.annotation;
    }
  }
  );
  let geste = '';
  this.modelAnnot1.forEach(an => {
    if (this.ctx !== null && this.ctx !== undefined) {
    const name = an.classe_geste;
    const frame1 = an.f1;
    const frame2 = an.f2;
    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);
    if (color != null){
      this.ctx.fillStyle = color;
    }
    else {
      this.ctx.fillStyle = 'black';
     }
    this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
    this.ctx.fillStyle = 'black';
    if (geste !== name && name !== undefined) {
      // this.ctx.fillText(name, this.timeToPos(t1) + 5, j);
      geste = name;
    }
  }
});
  }
else if (k === 2){
    this.modelAnnot2 = [];
    this.annotationIA.forEach(list => {
     if (list.name === this.sequenceCurrent.id && list.idModel === this.timeline2.replace('Classes ', '')){
       this.modelAnnot2 = list.annotation;
     }
    });
    let geste = '';
    this.modelAnnot2.forEach(elt => {
      if (this.ctx !== null && this.ctx !== undefined) {
      const name = elt.classe_geste;
      const frame1 = elt.f1;
      const frame2 = elt.f2;
      const t1 = this.convertFrameToTime(Number(frame1));
      const t2 = this.convertFrameToTime(Number(frame2));
      const color = localStorage.getItem(name);
      if (color !== null){
        this.ctx.fillStyle = color;
      }
      else{
        this.ctx.fillStyle = 'black';
       }
      this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
      this.ctx.fillStyle = 'black';
      if (geste === name){
      }
      else{
       if (name !== undefined){
       // this.ctx.fillText(name, this.timeToPos(t1) + 5, j);
       }
       geste = name;
      }
      }
    });
 }

}

public draw_ia_recouvrement(j: number, k: number): void{
  if (this.ctx !== null && this.ctx !== undefined) {
  this.get_ia(k);
  let tmp = this.gesteIA1;
  if (k === 2){
    tmp = this.gesteIA2;
  }
  let geste = '';
  let nbCorrect = 0;
  const nbFrame = this.convertTimeToFrame(Number(this.tempsTotal));
  for (let i = 0; i < this.veriteTerrain.length; i++){
            const t1 = this.convertFrameToTime(Number(i));
            const t2 = this.convertFrameToTime(Number(i + 1));
            if (this.veriteTerrain[i] === tmp[i]  && this.veriteTerrain[i] !== undefined){
              this.ctx.fillStyle = 'green';
              nbCorrect++;
              this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
              this.ctx.fillStyle = 'black';
              if (geste === this.veriteTerrain[i]) {
              }
              else{
              if (this.veriteTerrain[i] !== undefined) {
              this.ctx.fillText(this.veriteTerrain[i], this.timeToPos(t1) + 5, j);
              }
              geste = this.veriteTerrain[i];
              }}
  }

  if (nbCorrect > 0){
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

public draw_verite(j: number): void{
  console.log(this.allAnnotation);
  this.allAnnotation.forEach(an => {
    if (this.ctx !== null && this.ctx !== undefined) {
    const name = an.classe_geste;
    const frame1 = an.f1;
    const frame2 = an.f2;

    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);
    if (color != null){
      this.ctx.fillStyle = color;
    }
    else{
      this.ctx.fillStyle = 'black';
     }
    this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(name, this.timeToPos(t1) + 5, j);

    }
  });
}

public get_annot(): void{
  this.allAnnotation = [];
  const lengthAnnotation = this.sizeOfAnnotations();
  for (let i = 1; i < lengthAnnotation; i++) {
    const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
    const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
    const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;

    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);

    const tmp = new Annotation();
    tmp.f1 = frame1;
    tmp.f2 = frame2;
    tmp.classe_geste = name;
    tmp.t1 = t1;
    tmp.t2 = t2;
    this.allAnnotation.push(tmp);
  }

  }

  public get_ia(i: number): void{
    if (i === 1) {
    this.gesteIA1 = [];
    this.annotationIA.forEach(list => {
      if (list.name === this.sequenceCurrent.id && list.idModel === this.timeline1.replace('Recouvrement ', '')){
        list.annotation.forEach(an => {
          for (let j = an.f1; j <= an.f2; j++){
            this.gesteIA1[j] = an.classe_geste;
          }
        });
      }
    });
  }
    else if (i === 2){
    this.gesteIA2 = [];
    this.annotationIA.forEach(list => {
      if (list.name === this.sequenceCurrent.id && list.idModel === this.timeline2.replace('Recouvrement ', '')){
        list.annotation.forEach(an => {
          for (let j = an.f1; j <= an.f2; j++){
            this.gesteIA2[j] = an.classe_geste;
          }
        });
      }
    });
    }
  }



  public get_verite(): void{
    this.veriteTerrain = [];
    const lengthAnnotation = this.sizeOfAnnotations();
    for (let i = 1; i < lengthAnnotation; i++) {
      const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
      const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
      const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;

      const t1 = this.convertFrameToTime(Number(frame1));
      const t2 = this.convertFrameToTime(Number(frame2));
      const color = localStorage.getItem(name);
      for (let j = Number(frame1); j <= Number(frame2); j++){
        this.veriteTerrain[j] = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
      }

  }}



  public convertFrameToTime(frame: number): number {
    if (frame >= 0 && frame < this.tabTimeCurrent.length) {
      if (Number(this.tabTimeCurrent[frame]) === 0 && frame !== 0){
        return this.tempsTotal;
      }
      return this.tabTimeCurrent[frame];
    }
    if (frame >= this.tabTimeCurrent.length) {
      return this.tempsTotal;
    }
    return 0;
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

  public onResize(): void{
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
