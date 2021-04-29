import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EngineExplorationService} from '../engine-exploration/engine-exploration.service';
import {EngineEvaluationService} from './engine-evaluation.service';
import {HttpClient} from '@angular/common/http';
import {Poids} from '../../class/evaluation/poids';

@Component({
  selector: 'app-engine-evaluation',
  templateUrl: './engine-evaluation.component.html',
  styleUrls: ['./engine-evaluation.component.css']
})
export class EngineEvaluationComponent implements OnInit {

  showFiller = false;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('box', {static: true})
  public box!: ElementRef<HTMLCanvasElement>;

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(public engServ: EngineEvaluationService, public http: HttpClient) { }

  ngOnInit(): void {
    this.listElementHTML.push(this.box);
    this.engServ.initialize(this.rendererCanvas, this.listElementHTML, false);
    this.engServ.animate();
  }

  changeFilter(value: any): void{
    this.engServ.filtreSelected = value;
  }

  changeValue(value: any): void{
    this.engServ.layerSelected = value;
    this.engServ.poids.forEach(elem => {
      if (this.engServ.layerSelected === elem.name){
        this.engServ.filtre = [];
        for (let i = 0; i < elem.biais.length; i++){
          this.engServ.filtre.push(String(i + 1));
        }
      }
    });

  }


  getPoids(): void {
    console.log(this.engServ)
    if (this.engServ.model !== undefined && this.engServ.filtreSelected !== undefined && this.engServ.layerSelected !== undefined){
      this.engServ.initialize(undefined, undefined, true);
    }
  }
}
