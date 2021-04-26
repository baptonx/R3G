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
  public modelAnnot_1:Array<Annotation> = [];
  public modelAnnot_2:Array<Annotation> = [];
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public margeEdgeMouse = 10;
  public geste_couleur:Map<string,string>=new Map<string,string>();
  public annotationIA:Array<Eval> = [];
  public model_eval_1:Set<string> = new Set<string>();
  public model_eval_2:Set<string> = new Set<string>();
  public sequenceCurrent!:Sequence;
  public tabTimeCurrent!:Array<number>;
  public geste_verite_terrain:string[]=[];
  public geste_ia_1:string[]=[];
  public geste_ia_2:string[]=[];
  public timeline_1:string="";
  public timeline_2:string="";


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
    this.model_eval_1.add("Vérité terrain")
    this.model_eval_2.add("Vérité terrain")
  }

  reset():void{
      this.timeline_1 = ""
      this.timeline_2 = ""

    
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
      // RectAnnotationIA
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      this.ctx.fillRect(this.margeTimeline, 230, this.unit * this.tempsTotal, 100);


      this.get_verite();
      this.get_annot();
      this.ctx.font = '12px Arial';

      if(this.timeline_1 === 'Vérité terrain'){
        this.draw_verite(100)
      }
      else if(this.timeline_1.includes('Recouvrement')){
        this.draw_ia_recouvrement(100,1)
      }
      else if(this.timeline_1.includes('Classes')){
        this.draw_ia_classes(100,1)

      }
      if(this.timeline_2 === 'Vérité terrain'){
        this.draw_verite(230)
      }
      else if(this.timeline_2.includes('Recouvrement')){
        this.draw_ia_recouvrement(230,2)
      }
      else if(this.timeline_2.includes('Classes')){
        this.draw_ia_classes(230,2)

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

public draw_ia_classes(j:number,k:number):void{
  if(k===1){
  if (this.ctx !== null && this.ctx !== undefined) {
   this.modelAnnot_1=[]
   this.annotationIA.forEach(list=>{
    if (list.name === this.sequenceCurrent.id && list.id_model === this.timeline_1.replace('Classes ','')){
      this.modelAnnot_1=list.annotation
    }
   })
    let geste=''
    for(let i=0;i<this.modelAnnot_1.length;i++){
    const name = this.modelAnnot_1[i].classe_geste
    const frame1 = this.modelAnnot_1[i].f1
    const frame2 = this.modelAnnot_1[i].f2
    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);
    if(color != null){
      this.ctx.fillStyle = color;
    }
    else { 
      this.ctx.fillStyle = 'black';
     }
    this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
    this.ctx.fillStyle = 'black';
    if (geste === name){
    }
    else{
      if(name !== undefined){
    //this.ctx.fillText(name, this.timeToPos(t1) + 5, j);
      }
    geste = name
    }
  }
}}
else if(k===2){
  if (this.ctx !== null && this.ctx !== undefined) {
    this.modelAnnot_2=[]
    this.annotationIA.forEach(list=>{
     if (list.name === this.sequenceCurrent.id && list.id_model === this.timeline_2.replace('Classes ','')){
       this.modelAnnot_2=list.annotation
     }
    })
     let geste=''
     for(let i=0;i<this.modelAnnot_2.length;i++){
     const name = this.modelAnnot_2[i].classe_geste
     const frame1 = this.modelAnnot_2[i].f1
     const frame2 = this.modelAnnot_2[i].f2
     const t1 = this.convertFrameToTime(Number(frame1));
     const t2 = this.convertFrameToTime(Number(frame2));
     const color = localStorage.getItem(name);
     if(color != null){
       this.ctx.fillStyle = color;
     }
     else { 
       this.ctx.fillStyle = 'black';
      }
     this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
     this.ctx.fillStyle = 'black';
     if (geste === name){
     }
     else{
       if(name !== undefined){
     //this.ctx.fillText(name, this.timeToPos(t1) + 5, j);
       }
     geste = name
     }
   }
 }
}



}

public draw_ia_recouvrement(j:number,k:number):void{
  if (this.ctx !== null && this.ctx !== undefined) {
  this.get_ia(k);
  let tmp=this.geste_ia_1
  if(k===2){
    tmp=this.geste_ia_2
  }
  let geste=''
  let nb_correct = 0
  let nb_frame = this.convertTimeToFrame(Number(this.tempsTotal))
      
          for(var i=0;i<this.geste_verite_terrain.length;i++){
            const t1 = this.convertFrameToTime(Number(i));
            const t2 = this.convertFrameToTime(Number(i+1));
            if(this.geste_verite_terrain[i] === tmp[i]  && this.geste_verite_terrain[i] !== undefined){
              this.ctx.fillStyle = 'green';
              nb_correct ++
              this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
              this.ctx.fillStyle = 'black';
              if (geste === this.geste_verite_terrain[i]){
              }
              else{
                if(this.geste_verite_terrain[i] !== undefined){
              this.ctx.fillText(this.geste_verite_terrain[i], this.timeToPos(t1) + 5, j);
                }
              geste = this.geste_verite_terrain[i]
              
            }}
          }

          if(nb_correct>0){
            if(k===1){
          this.ctx.font = '14px Arial';
          this.ctx.fillStyle = 'black';
          let pourcentage = (nb_correct/nb_frame*100).toFixed(2)
          this.ctx.fillText('Taux de recouvrement : '+pourcentage+'%', this.timeToPos(0), 20);
            }
            else if(k===2){
              this.ctx.font = '14px Arial';
              this.ctx.fillStyle = 'black';
              let pourcentage = (nb_correct/nb_frame*100).toFixed(2)
              this.ctx.fillText('Taux de recouvrement : '+pourcentage+'%', this.timeToPos(Number(this.tempsTotal))/2, 20);
            }
          }this.ctx.font = '12px Arial';
}
}
      
public draw_verite(j:number):void{
  if (this.ctx !== null && this.ctx !== undefined) {
  for (let i = 0; i < this.allAnnotation.length; i++) {
    const name = this.allAnnotation[i].classe_geste
    const frame1 = this.allAnnotation[i].f1
    const frame2 = this.allAnnotation[i].f2

    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);
    if(color != null){
      this.ctx.fillStyle = color;
    }
    else { 
      this.ctx.fillStyle = 'black';
     }
    this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), 100);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(name, this.timeToPos(t1) + 5, j);
  }
}
}

public get_annot():void{
  this.allAnnotation = []
  const lengthAnnotation = this.sizeOfAnnotations();
  for (let i = 1; i < lengthAnnotation; i++) {
    const name = this.sequenceCurrent.metaDonnees.annotation[i.toString()].type;
    const frame1 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].debut;
    const frame2 = this.sequenceCurrent.metaDonnees.annotation[i.toString()].fin;

    const t1 = this.convertFrameToTime(Number(frame1));
    const t2 = this.convertFrameToTime(Number(frame2));
    const color = localStorage.getItem(name);

    let tmp=new Annotation()
    tmp.f1 = frame1
    tmp.f2 = frame2
    tmp.classe_geste = name
    tmp.t1 = t1
    tmp.t2 = t2
    this.allAnnotation.push(tmp)
  }

  }

  public get_ia(i:number):void{
    if(i===1){
    this.geste_ia_1=[]
    this.annotationIA.forEach(list=>{
      if (list.name === this.sequenceCurrent.id && list.id_model === this.timeline_1.replace('Recouvrement ','')){
        list.annotation.forEach(an=>{
          for(let j=an.f1;j<=an.f2;j++){
            this.geste_ia_1[j]=an.classe_geste
          }
        })
      }
    })}
    else if (i===2){
      this.geste_ia_2=[]
    this.annotationIA.forEach(list=>{
      if (list.name === this.sequenceCurrent.id && list.id_model === this.timeline_2.replace('Recouvrement ','')){
        list.annotation.forEach(an=>{
          for(let j=an.f1;j<=an.f2;j++){
            this.geste_ia_2[j]=an.classe_geste
          }
        })
      }
    })
    }
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
