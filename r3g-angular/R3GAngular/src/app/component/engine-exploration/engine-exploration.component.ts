import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggle} from '@angular/material/button-toggle';
import {EngineService} from '../engine/engine.service';
import {EngineExplorationService} from './engine-exploration.service';

@Component({
  selector: 'app-engine-exploration',
  templateUrl: './engine-exploration.component.html',
  styleUrls: ['./engine-exploration.component.css']
})
export class EngineExplorationComponent implements OnInit {

  showFiller = false;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('box', {static: true})
  public box!: ElementRef<HTMLCanvasElement>;

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(public engServ: EngineExplorationService) { }

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
