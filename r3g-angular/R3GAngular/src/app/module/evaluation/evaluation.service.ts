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
  public actionsVoxel: Array<AnimationAction> = [];
  public widthCanvas!: number;
  public mouseDownAnnotationRightEdge!: boolean;
  public mouseDownAnnotationLeftEdge!: boolean;
  public annotationCurrent!: Annotation;
  public indiceAnnotationSelected!: number;
  public mousePosJustBefore!: number;
  public annotationIA: Array<Eval> = [];
  public classZero = '';
  public modelEval: Array<Set<string>> = []
  public selectedModel: string = "";
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
  public heightStd: number = 40

  // Timeline
  public ctx!: CanvasRenderingContext2D | null;
  public pauseAction!: boolean;
  private posTimelineY: Array<number>;
  public timelines: Array<string>;
  public facteurScale: number;
  public callForUpdateTimeScal: (() => void) | undefined;
  public anyChange: Boolean = false;

  constructor(private eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.sizeIndicatorTime = 20;
    this.margeTimeline = 20;
    this.marge = 25;
    this.cursorSize = 6;
    this.indiceAnnotationSelected = -1;
    this.mousePosJustBefore = -1;
    this.facteurScale = 1;

    this.observableShowSquelette = new BehaviorSubject<boolean>(this.showSquelette);
    let nbTimeline = 7
    this.posTimelineY = Array.from(Array(nbTimeline)).map((_, i) => 20 + i * (this.heightStd + 5));
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
      // if(!this.anyChange)
      //   return;
      //

      this.anyChange = false;
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

      for (let i = 0; i < this.timelines.length; i++) {
        if(this.timelines[i]===undefined)
          continue

        if (this.timelines[i] === 'Vérité terrain') {
          this.draw_tmp(this.posTimelineY[i], true, null);
        } else if (this.timelines[i].includes('Recouvrement')) {
          this.draw_ia_recouvrement(i);
        } else if (this.timelines[i].includes('Classes')) {
          this.draw_tmp(this.posTimelineY[i], false, i);
        } else if (this.timelines[i].includes('Brutt')) {
          this.draw_brut(i, false);
        } else if (this.timelines[i].includes('BrutSimplified')) {
          this.draw_brut(i, true);
        } else if (this.timelines[i].includes('RejectConf')) {
          this.draw_reject(i,true);
        } else if (this.timelines[i].includes('RejectDist')) {
          this.draw_reject(i,false);
        } else if (this.timelines[i].includes('Repeat')) {
          this.draw_repeat(i, false);
        }else if (this.timelines[i].includes('GTCuDi')) {
            this.draw_repeat(i,true);
        } else if (this.timelines[i].includes('ERDetailed')) {
          this.draw_ER_detailedResult(i);
        } else if (this.timelines[i].includes('ERBoundedDetailed')) {
          this.draw_ERBounded_detailedResult(i);
        } else if (this.timelines[i].includes('windowCuDi')) {
          this.draw_window(i);
        } else if (this.timelines[i].includes('windowTemporal')) {
          // this.draw_ER_detailedResult(i);
        }

      }
      if (this.action !== undefined) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.action.time * this.unit + this.margeTimeline, 0, this.cursorSize, canvas.height);
      }


    }
  }

  private drawBorder(ctx: CanvasRenderingContext2D, xPos: number, yPos: number, width: number, height: number, thickness: number = 1) {
    ctx.fillStyle = '#0008';
    ctx.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
  }

  public draw_tmp(j: number, GT: boolean, idTimeline: number | null): void {
    if (this.sequenceCurrent !== undefined) {
      let list = this.sequenceCurrent.listAnnotation;
      if (!GT) {
        if (idTimeline == null) {
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
          this.drawBorder(this.ctx, this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
          const color = localStorage.getItem(name);
          if (color != null) {
            this.ctx.fillStyle = color;
          } else {
            this.ctx.fillStyle = 'white';
          }
          this.ctx.fillRect(this.timeToPos(t1), j, this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
          this.ctx.fillStyle = 'black';
          if (geste !== name && name !== undefined) {
            this.ctx.fillText(name, this.timeToPos(t1) + 5, j + this.heightStd / 2);
            geste = name;
          }
          const actPoint = an.pointAction;
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(this.timeToPos(this.convertFrameToTime(actPoint)), j + 2, this.timeToPos(this.convertFrameToTime(actPoint+1))-this.timeToPos(this.convertFrameToTime(actPoint)), this.heightStd / 3);
          this.ctx.fillStyle = 'black';
          this.ctx.fillRect(this.timeToPos(this.convertFrameToTime(actPoint)), this.heightStd / 3 + j, this.timeToPos(this.convertFrameToTime(actPoint+1))-this.timeToPos(this.convertFrameToTime(actPoint)), this.heightStd / 3);
          this.ctx.fillStyle = 'red';
          this.ctx.fillRect(this.timeToPos(this.convertFrameToTime(actPoint)), 2 * this.heightStd / 3 + j - 2, this.timeToPos(this.convertFrameToTime(actPoint+1))-this.timeToPos(this.convertFrameToTime(actPoint)), this.heightStd / 3 - 2);

        }
      });
    }
  }

  public draw_repeat(idTimeline: number,GTCuDiDraw:boolean): void {
    if (this.sequenceCurrent !== undefined) {
      let repeat: Array<number> = [];
      let GT :Array<string> = [];
      if (idTimeline == null) {
        alert("idTimeline ne doit pas être null")
        return;
      }
      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('Repeat ', '').replace('GTCuDi ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              repeat = ev.listRepeat;
              GT = ev.GTCuDi;
            }
          }
        }
      );
      if (repeat.length == 0) {
        console.error("No result for this Data")
        return;
      }
      if(repeat.length!==GT.length)
      {
        console.error("ERREUR SIZE : repeat.length!==GT.length")
        throw Error("repeat.length!==GTCuDI.length")
      }
      let cumulativeSumRepeat: Array<number> = [];
      repeat.reduce(function (a, b, i) {
        return cumulativeSumRepeat[i] = a + b;
      }, -1)
      let geste = '';
      if (this.ctx !== null && this.ctx !== undefined) {
        let frame1 = 0;
        for (let i = 0; i < cumulativeSumRepeat.length; i++) {

          const name = repeat[i] + "";
          const frame2 = Number(cumulativeSumRepeat[i])+1;
          let GTi = GT[i];

          const t1 = this.convertFrameToTime(Number(frame1));
          const t2 = this.convertFrameToTime(frame2); //draw until the begin of the following frame
          // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
          let color:string ;
          if(GTCuDiDraw)
          {
            let c = localStorage.getItem(GTi);
            if(c!==null)
              color = c;
            else
              color="black"
          }
          else
          {
            if (i % 2 == 0) {
              color = "black";
            } else {
              color = 'white';
            }
          }
          this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
          this.ctx.fillStyle = color;
          this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
          this.ctx.font = '10px Arial';
          this.ctx.fillStyle = 'red';
          if (geste !== name && name !== undefined) {
            this.ctx.fillText(name, this.timeToPos(t1) + 5, this.posTimelineY[idTimeline] + this.heightStd / 3);
            geste = name;
          }

          if(GTCuDiDraw)
          {
            this.ctx.fillText(GTi, this.timeToPos(t1) + 8, this.posTimelineY[idTimeline] + 2*this.heightStd / 3);
          }
          frame1 = frame2;

        }
      }


    }
  }

  public draw_brut(idTimeline: number, simplified: boolean): void {
    if (this.sequenceCurrent !== undefined) {
      let listPred: Array<string> = [];
      let repeat: Array<number> = [];

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
      if (listPred.length == 0) {
        console.error("list is 0 for result brute pred");
        return;
      }

      if (listPred.length != repeat.length) {
        alert("ERREUR list length pred != repeat, pred:" + listPred.length + " rep :" + repeat.length)
        return;
      }
      if (this.ctx === null) {
        return;
      }
      let cumulativeSumRepeat: Array<number> = [];
      repeat.reduce(function (a, b, i) {
        return cumulativeSumRepeat[i] = a + b;
      }, -1)
      let i = 0
      while (i < listPred.length - 1) {
        let pred = listPred[i];
        let rep = cumulativeSumRepeat[i]
        let start = this.convertFrameToTime(rep)
        let end = this.convertFrameToTime(rep + 1)

        if (simplified) {
          while (listPred[i + 1] === pred && i + 1 < listPred.length - 1) {
            i += 1
          }
          end = this.convertFrameToTime(cumulativeSumRepeat[i + 1])//end will be i+1
        }

        this.drawBorder(this.ctx, this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd)
        const color = localStorage.getItem(pred);
        if (color != null) {
          this.ctx.fillStyle = color;
        } else {
          this.ctx.fillStyle = 'white';
        }
        this.ctx.fillRect(this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(pred, this.timeToPos(start) + 2, this.posTimelineY[idTimeline] + this.heightStd / 2);
        i += 1;
      }
    }
  }

  public draw_window(idTimeline: number): void {
    if (this.sequenceCurrent !== undefined) {
      let listWindow: Array<number> = [];
      let repeat: Array<number> = [];

      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('windowCuDi ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              listWindow = ev.windowCuDi;
              repeat = ev.listRepeat;
            }
          }
        }
      );
      if (listWindow.length == 0) {
        console.error("list is 0 for result brute pred");
        return;
      }

      if (listWindow.length != repeat.length) {
        alert("ERREUR list length pred != repeat, pred:" + listWindow.length + " rep :" + listWindow.length)
        return;
      }
      if (this.ctx === null) {
        return;
      }
      let cumulativeSumRepeat: Array<number> = [];
      repeat.reduce(function (a, b, i) {
        return cumulativeSumRepeat[i] = a + b;
      }, -1)
      let i = 0
      let theTime =  this.convertTimeToFrame(this.action.time)
      while (i < listWindow.length - 1) {
        if(! ( cumulativeSumRepeat[i-1] <=theTime  && theTime<cumulativeSumRepeat[i]))
        {
          i+=1
          continue;
        }

        let pred = listWindow[i];
        let rep = cumulativeSumRepeat[i]
        let start = this.convertFrameToTime(cumulativeSumRepeat[i-1-pred])
        let end = this.convertFrameToTime(cumulativeSumRepeat[i-1])

        // if (simplified) {
        //   while (listPred[i + 1] === pred && i + 1 < listPred.length - 1) {
        //     i += 1
        //   }
        //   end = this.convertFrameToTime(cumulativeSumRepeat[i + 1])//end will be i+1
        // }

        this.drawBorder(this.ctx, this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd)

        this.ctx.fillStyle = 'green';

        this.ctx.fillRect(this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(pred+"", this.timeToPos(start) + 2, this.posTimelineY[idTimeline] + this.heightStd / 2);
        i += 1;
        break
      }
    }
  }


  private draw_reject(idTimeline: number,confusion:boolean) {
    if (this.sequenceCurrent !== undefined) {
      let listRej: Array<number> = [];
      let listPred: Array<string> = [];
      let repeat: Array<number> = [];

      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('RejectConf ', '').replace('RejectDist ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              if(confusion)
                listRej = ev.brutResultRejectConfusion;
              else
                listRej = ev.brutResultRejectDistance;
              listPred = ev.brutResultPred;
              repeat = ev.listRepeat;
            }
          }
        }
      );
      if (listRej.length == 0) {
        console.error("list is 0 for result brute pred");
        return;
      }

      if (listRej.length != repeat.length) {
        alert("ERREUR list length pred != repeat, pred:" + listPred.length + " rep :" + repeat.length)
        return;
      }
      if (this.ctx === null) {
        return;
      }
      let cumulativeSumRepeat: Array<number> = [];
      repeat.reduce(function (a, b, i) {
        return cumulativeSumRepeat[i] = a + b;
      }, -1)
      let offsetY = this.posTimelineY[idTimeline];
      let pos0 = this.timeToPos(this.convertFrameToTime(0))
      this.ctx.fillStyle = "rgba(250,20,20,0.5)";
      this.ctx.fillRect(pos0, offsetY + this.heightStd / 2, this.timeToPos(this.tempsTotal) - pos0, 1)
      let oldPosX = this.timeToPos(this.convertFrameToTime(cumulativeSumRepeat[0]))
      let oldPosY = offsetY + this.heightStd

      this.ctx.moveTo(oldPosX, oldPosY)

      for (let j = 0; j < listRej.length; j++) {
        let rejI: number = listRej[j];
        let correspondingFrame = cumulativeSumRepeat[j]
        let correspondingTime = this.convertFrameToTime(correspondingFrame)
        let posX = this.timeToPos(correspondingTime)

        let posY = offsetY + (1 - rejI) * this.heightStd;
        let color;
        if (j > 0)
          color = localStorage.getItem(listPred[j - 1]); //return null if unknown
        else
          color = null
        this.ctx.beginPath();
        this.ctx.moveTo(oldPosX, oldPosY)
        this.ctx.lineTo(posX, posY);
        if (color != null) {
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 2;
        } else {
          this.ctx.strokeStyle = 'black';
        }
        this.ctx.stroke();
        oldPosX = posX;
        oldPosY = posY;

      }
    }
  }

  public draw_ia_recouvrement(idTimeline: number): void {
    if (this.ctx !== null && this.ctx !== undefined) {
      this.get_ia(idTimeline);
      let tmp = this.gesteIA[idTimeline];
      let vraiPositif = 0;
      let fauxPositif = 0;
      let vraiNegatifOrange = 0;
      let vraiNegatifRouge = 0;
      let fauxNegatif = 0;
      const nbFrame = this.convertTimeToFrame(Number(this.tempsTotal));
      if (tmp.length > 0) {
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
              this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
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
              this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
              this.ctx.fillStyle = 'black';
            } else if (this.veriteTerrain[i] === undefined && tmp[i] === this.classZero) {
              // this.drawBorder(this.ctx,this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
              this.ctx.fillStyle = 'lightgreen';
              fauxPositif++;
              this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
              this.ctx.fillStyle = 'black';
            }
          }
        }
        const pourcentage1 = (vraiPositif / nbFrame * 100).toFixed(2);
        const pourcentage2 = (fauxPositif / nbFrame * 100).toFixed(2);
        const pourcentage4 = (vraiNegatifOrange / nbFrame * 100).toFixed(2);
        const pourcentage3 = (vraiNegatifRouge / nbFrame * 100).toFixed(2);
        const pourcentage5 = (fauxNegatif / nbFrame * 100).toFixed(2);
        let yVal = this.posTimelineY[this.posTimelineY.length - 1];
        console.log("yVal", yVal)
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

  public draw_ER_detailedResult(idTimeline: number): void {
    if (this.sequenceCurrent !== undefined) {
      let detailResult: Array<Array<number>> = []
      let actionsPoint: Array<number> = this.sequenceCurrent.listAnnotation.map<number>(v => v.pointAction);

      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('ERDetailed ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              detailResult = ev.detailResults;
            }
          }
        }
      );
      if (actionsPoint.length != detailResult.length) {
        console.error("AIE AIE AIE, detail results does not correponds to the number of actionPoint");
        return;
      }

      if (this.ctx === null) {
        return;
      }

      for (let i = 0; i < detailResult.length; i++) {
        let actPointFrame = actionsPoint[i];
        let listOfFrameForThisActPoint = detailResult[i];

        for (let f = 0; f < listOfFrameForThisActPoint.length; f++) {
          let res: number = listOfFrameForThisActPoint[f];
          //   -5 : the corresponding frame is before the action start
          //   -4 : the corresponding frame is not an action (0)
          //  -3 :  FN
          //   -2 : FP
          //   -1 : no starts found between action start and observed frame
          //   0  : Reject prediction
          //   1  : TP
          let colors = ["white", "#EDA", "red", "orange", "#AAF", "#777", "green"]
          let indexFrame = listOfFrameForThisActPoint.length - f - 1 // 25
          let start = actPointFrame - indexFrame;
          let time = this.convertFrameToTime(start)
          let timeEnd = this.convertFrameToTime(start + 1)

          this.ctx.fillStyle = colors[res + 5];
          // this.drawBorder(this.ctx,this.timeToPos(start), this.posTimelineY[idTimeline], this.timeToPos(end) - this.timeToPos(start), this.heightStd)
          this.ctx.fillRect(this.timeToPos(time), this.posTimelineY[idTimeline], this.timeToPos(timeEnd) - this.timeToPos(time), this.heightStd);
          this.ctx.font = '9px Arial';
          this.ctx.fillStyle = '#FAA';
          this.ctx.fillText("-" + indexFrame, this.timeToPos(time), this.posTimelineY[idTimeline] + this.heightStd);
          // this.ctx.font = '9px Arial';
          // this.ctx.fillStyle = '#F99';
          this.ctx.fillText(res+"", this.timeToPos(time), this.posTimelineY[idTimeline] + this.heightStd/2);

        }

      }
    }
  }

  public draw_ERBounded_detailedResult(idTimeline: number): void {
    if (this.sequenceCurrent !== undefined) {
      let detailResult: Array<number> = []
      let list: Array<Annotation> =[];
      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.timelines[idTimeline].replace('ERBoundedDetailed ', '')) {
              // this.modelAnnot[ev.idModel] = ev.annotation;
              detailResult = ev.detailResultsERBounded;
              list = ev.annotation;

            }
          }
        }
      );
      if (list.length != detailResult.length) {
        console.error("AIE AIE AIE, detail bounded results does not correponds to the number of predicted bound");
        return;
      }

      if (this.ctx === null) {
        return;
      }

      let geste = ""

      for (let i = 0; i < detailResult.length; i++) {
        let actPointFrame:Annotation = list[i];
        let res = detailResult[i];
        // 1 :TP
        // 0 : reject
        // -1 : FP on action (wrong class)
        // -2 : FP on action (IoU <Mini)
        // -3 : FP on BG/flag taken

        const name = actPointFrame.classeGeste;
        const frame1 = actPointFrame.f1;
        const frame2 = actPointFrame.f2;

        const t1 = this.convertFrameToTime(Number(frame1));
        const t2 = this.convertFrameToTime(Number(frame2));
        this.drawBorder(this.ctx, this.timeToPos(t1),  this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd)
        let color;
        switch (res) {
            case 0: color = 'grey'
              break
          case -1:
            case -2:
              color = 'orange'
            break
          case -3: color = 'red'
            break
          case 1: color = 'green'
            break

        }
        if (color != null) {
          this.ctx.fillStyle = color;
        } else {
          this.ctx.fillStyle = 'white';
        }
        this.ctx.fillRect(this.timeToPos(t1), this.posTimelineY[idTimeline], this.timeToPos(t2) - this.timeToPos(t1), this.heightStd);
        this.ctx.fillStyle = 'black';
        if (geste !== name && name !== undefined) {
          this.ctx.fillText(name, this.timeToPos(t1) + 5, this.posTimelineY[idTimeline] + this.heightStd / 2);
          geste = name;
        }
        this.ctx.fillText(res+"", this.timeToPos(t1) + 2, this.posTimelineY[idTimeline] + this.heightStd / 4);


      }
    }
  }

  public underline(color: string, text: string, x: number, y: number): void {
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
      for (let i = 0; i < this.tabTimeCurrent.length-1; i++) {
        if (this.tabTimeCurrent[i+1] >= time) {
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
    if (this.posTimelineY == null)
      return null;
    for (let i = this.posTimelineY.length; i >= 0; i--) {
      let posIM1: number = this.posTimelineY[i];
      if (posY >= posIM1)
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
      this.draw();
    } else if (this.sequenceCurrent !== undefined) {
      // const posX = $event.offsetX;
      // const posY = $event.offsetY;
      //
      //
      // let index:number|null = this.getTimeLineCorrrepondingTo(posY)
      // if(index==null)
      //   return;
      // const newValueTime = this.posToTime(posX);
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


  refreshAlsoVoxelization() {
    if (this.callForUpdateTimeScal !== undefined)
      this.callForUpdateTimeScal();
  }

  convertFrameToFrameCuDi(frame: number) {
    if (this.sequenceCurrent !== undefined) {
      let repeat: Array<number> = [];

      this.annotationIA.forEach(ev => {
          if (ev.name === this.sequenceCurrent.id) {
            if (ev.idModel === this.selectedModel) {
              repeat = ev.listRepeat;
            }
          }
        }
      );

      let cumulativeSumRepeat: Array<number> = [];
      repeat.reduce(function (a, b, i) {
        return cumulativeSumRepeat[i] = a + b;
      }, -1)

      for (let i = 1; i < cumulativeSumRepeat.length; i++) {
        const numberM1 = cumulativeSumRepeat[i - 1];
        const number = cumulativeSumRepeat[i];
        if (numberM1 <= frame && frame <= number) {
          return i;
        }
      }
    }
    return 0
  }
}
