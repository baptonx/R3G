import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EngineEvaluationSqueletteService} from './engine-evaluation-squelette.service';

@Component({
  selector: 'app-engine-evaluation-squelette',
  templateUrl: './engine-evaluation-squelette.component.html',
  styleUrls: ['./engine-evaluation-squelette.component.css']
})
export class EngineEvaluationSqueletteComponent implements OnInit {

  showFiller = false;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('box', {static: true})
  public box!: ElementRef<HTMLCanvasElement>;

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(public engServ: EngineEvaluationSqueletteService) {
  }

  ngOnInit(): void {
    this.listElementHTML.push(this.box);
    this.engServ.initialize(this.rendererCanvas, this.listElementHTML, false);
    this.engServ.animate();
  }

  updateSizeCube(event: any): void {
    this.engServ.updateSizeCube(event);
  }

  updateTimeScale(event: any): void {
    this.engServ.updateTimeScale(event);
  }

}
