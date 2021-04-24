import { Injectable } from '@angular/core';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { EventManager } from '@angular/platform-browser';
import { tmpdir } from 'os';
import { Annotation } from 'src/app/class/commun/annotation/annotation';
import { Sequence } from 'src/app/class/commun/sequence';
import { Eval } from 'src/app/class/evaluation/eval';
import { BddService } from 'src/app/service/bdd.service';
import { AnimationAction } from 'three';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

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
  public annotationCurrent!: Annotation;
  public allAnnotation: Array<Annotation> = [];
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public margeEdgeMouse = 10;
  public geste_couleur:Map<string,string>=new Map<string,string>();
  public annotationIA:Array<Eval> = [];
  public sequenceCurrent!:Sequence;
  public tabTimeCurrent!:Array<number>;
  public geste_verite_terrain:string[]=[];
  public geste_ia_1:string[]=[];


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
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.widthCanvas = this.ctx.canvas.width;
      this.unit = (canvas.width - this.margeTimeline * 2) / this.tempsTotal;
      this.ctx.clearRect(0,0,canvas.width,canvas.height)


      // ======================================================
      // RectAnnotationVeriteTerrain
      this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.ctx.fillRect(this.margeTimeline, 100, this.unit * this.tempsTotal, 100);

      // ======================================================
      // AnnotationVeriteTerrain
      const lengthAnnotation = this.sizeOfAnnotations();
      console.log(this.sequenceCurrent.metaDonnees.annotation)
      /*
      if (this.sequenceCurrent !== undefined) {
        console.log(this.sequenceCurrent.metaDonnees.annotation);
      }
       */

      this.get_verite();
      this.get_ia();
      console.log(this.geste_verite_terrain)

   
  
      this.ctx.font = '12px Arial';

      if(this.geste_ia_1.length==0 && this.geste_verite_terrain.length>0){
      for (let i = 1; i < lengthAnnotation; i++) {
        const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
        const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
        const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;
   
        const t1 = this.convertFrameToTime(Number(frame1));
        const t2 = this.convertFrameToTime(Number(frame2));
        const color = localStorage.getItem(name);
    

        if(this.geste_verite_terrain.length>0 && this.geste_ia_1.length==0){

        if(color != null){
          this.ctx.fillStyle = color;
        }
        else { 
          this.ctx.fillStyle = 'black';
         }
        this.ctx.fillRect(this.timeToPos(t1), 100, this.timeToPos(t2) - this.timeToPos(t1), 100);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(name, this.timeToPos(t1) + 5, 100);
        }
      }}
        else{
          let geste=''
          for(var i=0;i<this.geste_verite_terrain.length;i++){
            const t1 = this.convertFrameToTime(Number(i));
            const t2 = this.convertFrameToTime(Number(i+1));
            if(this.geste_verite_terrain[i] === this.geste_ia_1[i]){
              this.ctx.fillStyle = 'green';
              this.ctx.fillRect(this.timeToPos(t1), 100, this.timeToPos(t2) - this.timeToPos(t1), 100);
              this.ctx.fillStyle = 'black';
              if (geste === this.geste_verite_terrain[i]){
              }
              else{
                if(this.geste_verite_terrain[i] !== undefined){
              this.ctx.fillText(this.geste_verite_terrain[i], this.timeToPos(t1) + 5, 100);
                }
              geste = this.geste_verite_terrain[i]
              }
            }
          }

        } 
     

      // ======================================================
      // PreviewAnnotationCurrent
      if (this.mouseDown && this.buttonModeAnnotation.checked === true) {
        this.ctx.fillStyle = 'rgba(0,255,0,0.3)';
        const pos1 = this.timeToPos(this.annotationCurrent.t1);
        const pos2 = this.timeToPos(this.annotationCurrent.t2);
        this.ctx.fillRect(pos1, 100, pos2 - pos1, 100);
      }

      // ======================================================
      // RectAnnotationIA
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(this.margeTimeline, 230, this.unit * this.tempsTotal, 100);

      
    
    }
  }

  public get_ia():void{
    this.geste_ia_1=[]
    this.annotationIA.forEach(list=>{
      if (list.name === this.sequenceCurrent.id){
        list.annotation.forEach(an=>{
          for(let j=an.f1;j<an.f2;j++){
            this.geste_ia_1[j]=an.classe_geste
          }
        })
      }
    })
  }

  public get_verite():void{
    this.geste_verite_terrain=[]
    const lengthAnnotation = this.sizeOfAnnotations();
    for (let i = 1; i < lengthAnnotation; i++) {
      const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
      const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
      const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;
 
      const t1 = this.convertFrameToTime(Number(frame1));
      const t2 = this.convertFrameToTime(Number(frame2));
      const color = localStorage.getItem(name);
  
      for(let j=Number(frame1);j<=Number(frame2);j++){
        this.geste_verite_terrain[j]=this.sequenceCurrent.metaDonnees.annotation[i.toString()].type
      }

  }}



  public convertFrameToTime(frame: number): number {
    if (frame >= 0 && frame < this.tabTimeCurrent.length) {
      if(this.tabTimeCurrent[frame]==0 && frame!=0){
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
