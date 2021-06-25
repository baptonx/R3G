import {Injectable} from '@angular/core';
import {EventManager} from '@angular/platform-browser';
import {Annotation} from 'src/app/class/commun/annotation/annotation';
import {Sequence} from 'src/app/class/commun/sequence';
import {Eval} from 'src/app/class/evaluation/eval';
import {AnimationAction} from 'three';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  public cursorSize!: number;
  public tempsTotal!: number;
  public sizeIndicatorTime!: number;
  public margeTimeline!: number;
  public marge!: number;
  public unit!: number;
  public action!: AnimationAction;
  public actionsVoxel: Array<AnimationAction>=[];
  public widthCanvas!: number;
  public mouseDownAnnotationRightEdge!: boolean;
  public mouseDownAnnotationLeftEdge!: boolean;
  public annotationCurrent!: Annotation;
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public annotationIA: Array<Eval> = [];
  public classZero = '';
  public modelEval: Array<Set<string>> = []
  public selectedModel:string = "";
  public sequenceCurrent!: Sequence;
  public tabTimeCurrent!: Array<number>;
  public veriteTerrain: string[] = [];
  public gesteIA: Array<string[]> = [];
  public scale = 1;
  public sequenceSquelette!: Sequence;
  public sequenceSqueletteVoxel!: Sequence;
  public showSquelette = true;
  public observableShowSquelette: BehaviorSubject<boolean>;
  public mouseDown!: boolean;
  public mouseDownCursor!: boolean;
  public heightStd:number = 40

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;
  public pauseAction!: boolean;
  private posTimelineY: Array<number> ;
  public timelines: Array<string>;

  constructor(private eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 20;
    this.marge = 25;
    this.cursorSize = 6;
    this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;


    this.observableShowSquelette = new BehaviorSubject<boolean>(this.showSquelette);
    let nbTimeline = 6
    this.posTimelineY = Array.from(Array(nbTimeline)).map((_, i) => 20 + i * (this.heightStd+5));
    this.timelines = Array.from(Array(nbTimeline)).map((_, i) => '');
    for (let i = 0; i < nbTimeline; i++) {
      this.modelEval.push(new Set<string>());
      this.modelEval[i].add('Vérité terrain');
      this.gesteIA.push(new Array<string>());
    }


    }

  reset(): void {
  }

  draw(): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      const canvas = this.ctx.canvas;
      this.widthCanvas = this.ctx.canvas.width;
      this.unit = (canvas.width - this.margeTimeline * 2) / this.tempsTotal;


      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < this.posTimelineY.length; i++) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(this.margeTimeline, this.posTimelineY[i], this.unit * this.tempsTotal, this.heightStd);
      }

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

      for (let i = 0; i < this.timelines.length ; i++) {
        if (this.timelines[i] === 'Vérité terrain') {
          this.draw_tmp(this.posTimelineY[i], true,null);
        } else if (this.timelines[i].includes('Recouvrement')) {
          this.draw_ia_recouvrement(i);
        } else if (this.timelines[i].includes('Classes')) {
          this.draw_tmp(this.posTimelineY[i],false ,i);
        } else if (this.timelines[i].includes('Brutt')) {
          this.draw_brut(i,false);
        }  else if (this.timelines[i].includes('BrutSimplified')) {
          this.draw_brut(i,true);
        }  else if (this.timelines[i].includes('Reject')) {
          this.draw_reject(i);
        }else if (this.timelines[i].includes('Repeat')) {
          this.draw_repeat(i);
        }

      }




      if (this.action !== undefined) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);
      }
    }
  }

  private drawBorder(ctx:CanvasRenderingContext2D,xPos:number, yPos:number, width:number, height:number, thickness:number = 1)
  {
    ctx.fillStyle='#000';
    ctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
  }

  public draw_tmp(j: number, GT:boolean,idTimeline:number|null): void {
    if (this.sequenceCurrent !== undefined) {
      let list = this.sequenceCurrent.listAnnotation;
      if (! GT)
      {
        if(idTimeline==null)
        {
          alert("idTimeline ne doit pas être null")
          return;
        }
        this.annotationIA.forEach(ev => {
            if (ev.name === this.sequenceCurrent.id) {
              if (ev.idModel === this.timelines[idTimeline].replace('Classes ', '')) {
                // this.modelAnnot[ev.idModel] = ev.annotation;
                list = ev.annotation;
              }
            }
          }
        );
      }

      let geste = '';
      list.forEach(an => {
        if (this.ctx !== null && this.ctx !== undefined) {
          const name = an.classeGeste;
          const frame1 = an.f1;
          const frame2 = an.f2;

          const t1 = this.convertFrameToTime(Number(frame1));
          const t2 = this.convertFrameToTime(Number(frame2));
          this.drawBorder(this.ctx,this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
          const color = localStorage.getItem(name);
          if (color != null) {
            this.ctx.fillStyle = color;
          } else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
          this.ctx.fillStyle = 'black';
          if (geste !== name && name !== undefined) {
            this.ctx.fillText(name, this.timeToPos(t1) + 5, j + this.heightStd/2);
            geste = name;
          }

        }
      });
    }
  }

  public draw_repeat(idTimeline: number): void {
    if (this.sequenceCurrent !== undefined) {
      let repeat:Array<number>=[] ;
        if(idTimeline==null)
        {
          alert("idTimeline ne doit pas être null")
          return;
        }
        this.annotationIA.forEach(ev => {
            if (ev.name === this.sequenceCurrent.id) {
              if (ev.idModel === this.timelines[idTimeline].replace('Repeat ', '')) {
                // this.modelAnnot[ev.idModel] = ev.annotation;
                repeat = ev.listRepeat;
              }
            }
          }
        );
        if(repeat.length==0)
        {
          alert("No result for this Data")
          return;
        }
      let cumulativeSumRepeat:Array<number> = [];
      repeat.reduce(function(a,b,i) { return cumulativeSumRepeat[i] = a+b; },-1)
      let geste = '';
      if (this.ctx !== null && this.ctx !== undefined) {
        let frame1 = 0;
        for (let i = 0; i < cumulativeSumRepeat.length; i++) {

          const name = repeat[i]+"";
          const frame2 = cumulativeSumRepeat[i];


          const t1 = this.convertFrameToTime(Number(frame1));
          const t2 = this.convertFrameToTime(Number(frame2));
          // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
          // const color = localStorage.getItem(name);
          if (i%2==0) {
            this.ctx.fillStyle = "black";
          } else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
          this.ctx.font = '10px Arial';
          this.ctx.fillStyle = 'red';
          if (geste !== name && name !== undefined) {
            this.ctx.fillText(name, this.timeToPos(t1) + 5, this.posTimelineY[idTimeline] + this.heightStd/2);
            geste = name;
          }
          frame1=frame2;

        }
      }


    }
  }
  public draw_brut(idTimeline:number,simplified:boolean): void {
    if (this.sequenceCurrent !== undefined) {
      let listPred:Array<string> = [];
      let repeat : Array<number>= [];

      this.annotationIA.forEach(ev => {
            if (ev.name === this.sequenceCurrent.id) {
              if (ev.idModel === this.timelines[idTimeline].replace('Brutt ', '').replace('BrutSimplified ', '')) {
                // this.modelAnnot[ev.idModel] = ev.annotation;
                listPred = ev.brutResultPred;
                repeat = ev.listRepeat;
              }
            }
          }
        );
      if (listPred.length==0)
      {
        console.error("list is 0 for result brute pred");
        return;
      }

      if(listPred.length!=repeat.length)
      {
        alert("ERREUR list length pred != repeat, pred:"+listPred.length+ " rep :"+repeat.length)
        return ;
      }
      if (this.ctx === null) {
        return;
      }
      let cumulativeSumRepeat:Array<number> = [];
      repeat.reduce(function(a,b,i) { return cumulativeSumRepeat[i] = a+b; },-1)
      let i = 0
      while (i < listPred.length-1) {
        let pred = listPred[i];
        let rep = cumulativeSumRepeat[i]
        let start = this.convertFrameToTime(rep)
        let end = this.convertFrameToTime(rep+1)

        if(simplified)
        {
          while (listPred[i+1]===pred && i+1<listPred.length-1)
          {
            i+=1
          }
          end = this.convertFrameToTime(cumulativeSumRepeat[i+1])//end will be i+1
        }

        this.drawBorder(this.ctx,this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd)
        const color = localStorage.getItem(pred);
        if (color != null) {
          this.ctx.fillStyle = color;
        } else {
          this.ctx.fillStyle = 'white';
        }
        this.ctx.fillRect(this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(pred, this.timeToPos(start) + 2, this.posTimelineY[idTimeline] + this.heightStd/2);
        i+=1;
      }
    }
  }


  private draw_reject(idTimeline: number) {
    if (this.sequenceCurrent !== undefined) {
      let listRej:Array<number> = [];
      let listPred:Array<string> = [];
      let repeat : Array<number>= [];

      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('Reject ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              listRej = ev.brutResultReject;
              listPred = ev.brutResultPred;
              repeat = ev.listRepeat;
            }
          }
        }
      );
      if (listRej.length==0)
      {
        console.error("list is 0 for result brute pred");
        return;
      }

      if(listRej.length!=repeat.length)
      {
        alert("ERREUR list length pred != repeat, pred:"+listPred.length+ " rep :"+repeat.length)
        return ;
      }
      if (this.ctx === null) {
        return;
      }
      let cumulativeSumRepeat:Array<number> = [];
      repeat.reduce(function(a,b,i) { return cumulativeSumRepeat[i] = a+b; },-1)
      let offsetY = this.posTimelineY[idTimeline];
      let pos0 =this.timeToPos(this.convertFrameToTime(0))
      this.ctx.fillStyle = "rgba(250,20,20,0.5)";
      this.ctx.fillRect(pos0,offsetY+this.heightStd/2,this.timeToPos(this.tempsTotal)-pos0,1)
      let oldPosX = this.timeToPos(this.convertFrameToTime(cumulativeSumRepeat[0]))
      let oldPosY= offsetY+this.heightStd

      this.ctx.moveTo(oldPosX,oldPosY)

      for (let j = 0; j < listRej.length; j++) {
        let rejI:number = listRej[j];
        let correspondingFrame = cumulativeSumRepeat[j]
        let correspondingTime = this.convertFrameToTime(correspondingFrame)
        let posX = this.timeToPos(correspondingTime)

        let posY = offsetY+(1-rejI)*this.heightStd;
        let color;
        if(j>0)
           color = localStorage.getItem(listPred[j-1]); //return null if unknown
        else
            color = null
        this.ctx.beginPath();
        this.ctx.moveTo(oldPosX,oldPosY)
        this.ctx.lineTo(posX, posY);
        if (color != null) {
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 2;
        } else {
          this.ctx.strokeStyle = 'black';
        }
        this.ctx.stroke();
        oldPosX= posX;
        oldPosY= posY;

      }


    }
  }

  public draw_ia_recouvrement(idTimeline:number): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      this.get_ia(idTimeline);
      let tmp = this.gesteIA[idTimeline];
      let vraiPositif = 0;
      let fauxPositif = 0;
      let vraiNegatifOrange = 0;
      let vraiNegatifRouge = 0;
      let fauxNegatif = 0;
      const nbFrame = this.convertTimeToFrame(Number(this.tempsTotal));
      if (tmp.length > 0){
      for (let i = 0; i < this.veriteTerrain.length; i++) {
        if (Number(i) < nbFrame) {
          const t1 = this.convertFrameToTime(Number(i));
          const t2 = this.convertFrameToTime(Number(i + 1));
          if (this.veriteTerrain[i] === tmp[i] && this.veriteTerrain[i] !== undefined && this.veriteTerrain[i] !== this.classZero) {
            // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
            this.ctx.fillStyle = 'green';
            vraiPositif++;
            this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
            this.ctx.fillStyle = 'black';
          } else if (this.veriteTerrain[i] !== tmp[i] && this.veriteTerrain[i] !== undefined
            && tmp[i] === this.classZero) {
            // console.log(this.veriteTerrain[i]);
            // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
            this.ctx.fillStyle = 'lightgray';
            fauxNegatif++;
            this.ctx.fillRect(this.timeToPos(t1),  this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
            this.ctx.fillStyle = 'black';
          } else if (this.veriteTerrain[i] !== tmp[i] && this.veriteTerrain[i] !== undefined && this.veriteTerrain[i] !== this.classZero
            && tmp[i] !== this.classZero) {
            // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
            this.ctx.fillStyle = 'red';
            vraiNegatifRouge++;
            // this.ctx.fillRect(this.timeToPos(t1),  this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
            this.ctx.fillStyle = 'black';
          } else if (this.veriteTerrain[i] === undefined && tmp[i] !== this.classZero) {
            // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
            this.ctx.fillStyle = 'orange';
            vraiNegatifOrange++;
            this.ctx.fillRect(this.timeToPos(t1),  this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
            this.ctx.fillStyle = 'black';
          } else if (this.veriteTerrain[i] === undefined && tmp[i] === this.classZero) {
            // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
            this.ctx.fillStyle = 'lightgreen';
            fauxPositif++;
            this.ctx.fillRect(this.timeToPos(t1),  this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
            this.ctx.fillStyle = 'black';
          }
        }
      }
      const pourcentage1 = (vraiPositif / nbFrame * 100).toFixed(2);
      const pourcentage2 = (fauxPositif / nbFrame * 100).toFixed(2);
      const pourcentage4 = (vraiNegatifOrange / nbFrame * 100).toFixed(2);
      const pourcentage3 = (vraiNegatifRouge / nbFrame * 100).toFixed(2);
      const pourcentage5 = (fauxNegatif / nbFrame * 100).toFixed(2);
      let yVal = this.posTimelineY[this.posTimelineY.length-1];
      console.log("yVal",yVal)
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = 'black';
      this.underline('green', 'Vrai Positif : ' + pourcentage1 + '%', 200, yVal);
      this.underline('lightgreen', 'Vrai Négatif : ' + pourcentage2 + '%', 400, yVal);
      this.underline('red', 'Faux Positif sur actions : ' + pourcentage3 + '%', 600, yVal);
      this.underline('orange', 'Faux Positif sur geste 0 : ' + pourcentage4 + '%', 800, yVal);
      this.underline('lightgray', 'Faux Négatif : ' + pourcentage5 + '%', 1000, yVal);
    }

  }
  }

  public underline(color: string, text: string, x: number, y: number): void{
    if (this.ctx !== null && this.ctx !== undefined) {
      const metrics = this.ctx.measureText(text);
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 24;
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + metrics.width, y);
      this.ctx.stroke();
      this.ctx.restore();
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(text, x, y);
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
    this.annotationIA.forEach(ev => {
      if (ev.name === this.sequenceCurrent.id) {
        if (ev.idModel === this.timelines[i].replace('Classes ', '').replace('Recouvrement ', '')) {
          ev.annotation.forEach(an => {
            for (let j = an.f1; j <= an.f2; j++) {
              this.gesteIA[i][j] = an.classeGeste;
            }
          });
        }
      }
    });
  }


  public get_verite(): void {
    if (this.sequenceCurrent !== undefined) {
      this.veriteTerrain = [];
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

  mouseOnCursor(posX: number): boolean {
    const posCursor = this.timeToPos(this.action.time);
    return (posCursor - this.cursorSize < posX) && (posCursor + this.cursorSize > posX);
  }
  public getTimeLineCorrrepondingTo(posY: number) {
    if (this.posTimelineY==null)
      return null  ;
    for (let i = this.posTimelineY.length; i >= 0; i--) {
      let posIM1:number = this.posTimelineY[i];
      if(posY>=posIM1)
        return i
    }
    return null;

  }

  onMouseMove($event: MouseEvent): void {


    if (this.sequenceCurrent !== undefined && this.mouseDownCursor) {
      const posX = $event.offsetX;
      const newValueTime = this.posToTime(posX);

      if (newValueTime > 0 && newValueTime < this.tempsTotal && this.action !== undefined) {
        this.action.time = newValueTime;
        for (const animationAction of this.actionsVoxel) {
          animationAction.time = newValueTime;
        }
      }

      this.mousePosJustBefore = posX;
    }else if (this.sequenceCurrent !== undefined )
    {
      const posX = $event.offsetX;
      const posY = $event.offsetY;

      let index:number|null = this.getTimeLineCorrrepondingTo(posY)
      if(index==null)
        return;
      const newValueTime = this.posToTime(posX);
      // if (newValueTime > 0 && newValueTime < this.tempsTotal) {
      //   this.findActionCorrespondingToFrame(this.convertTimeToFrame(newValueTime),index==0)
      // }


    }
  }

  onWheelMove($event: WheelEvent): void {
    this.scale += $event.deltaY * -0.01;
    console.log(this.scale);
  }

  onMouseDown(event: MouseEvent): void {
    const posX = event.offsetX;
    this.mouseDown = true;
    if (this.mouseOnCursor(posX)) {
      this.mouseDownCursor = true;
    }
  }
  onMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
    this.mouseDownCursor = false;
  }

  public play(): void {
    if (this.pauseAction) {
      this.playForward();
    } else {
      this.action.timeScale = 1;
      this.pauseAction = true;
      // this.clip.duration = this.action.time;
      this.action.play();
      this.action.paused = true;
      for (const animationAction of this.actionsVoxel) {
        animationAction.timeScale = 1;
        animationAction.play();
        animationAction.paused = true;
      }

    }
  }

  public playForward(): void {
    this.pauseAction = false;
    this.action.paused = false;
    const t = this.action.time;
    this.action.stop();
    this.action.time = t;
    // this.clip.duration = this.tempsTotal;
    this.action.timeScale = 1;
    this.action.play();
    for (const animationAction of this.actionsVoxel) {
      animationAction.timeScale = 1;
      animationAction.stop();
      animationAction.time = t;
      animationAction.paused = false;
      animationAction.play();
    }
  }

  public playBackward(): void {
    this.pauseAction = false;
    const t = this.action.time;
    this.action.stop();
    this.action.time = t;
    // this.clip.duration = this.tempsTotal;
    // this.annotationServ.action.setLoop(THREE.LoopOnce);
    this.action.timeScale = -1;
    this.action.play();

    for (const animationAction of this.actionsVoxel) {
      animationAction.timeScale = -1;
      animationAction.stop();
      animationAction.time = t;
      animationAction.paused = false;
      animationAction.play();
    }
  }

  public stopToStart(): void {
    this.action.timeScale = 1;
    this.action.stop();
    this.action.time = 0;
    // this.clip.duration = 0;
    this.action.play();
    this.action.paused = true;
    this.pauseAction = true;

    for (const animationAction of this.actionsVoxel) {
      animationAction.timeScale = 1;
      animationAction.stop();
      animationAction.time = 0;
      animationAction.play();
      animationAction.paused = true;
    }
  }

  public stopToEnd(): void {
    this.action.timeScale = 1;
    this.action.stop();
    this.action.time = this.tempsTotal;
    // this.clip.duration = this.tempsTotal;
    this.action.play();
    this.pauseAction = true;
    for (const animationAction of this.actionsVoxel) {
      animationAction.timeScale = 1;
      animationAction.stop();
      animationAction.time = this.tempsTotal;
      animationAction.play();
      animationAction.paused = true;
    }
  }

  public pause(): void {
    this.pauseAction = true;
    // this.clip.duration = this.action.time;
    this.action.play();
    for (const animationAction of this.actionsVoxel) {
      animationAction.play();
    }
  }



}
