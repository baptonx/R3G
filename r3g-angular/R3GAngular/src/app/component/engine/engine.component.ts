import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EngineService} from "./engine.service";

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css'],
  providers: [EngineService]
})
export class EngineComponent implements OnInit {

  showFiller = false;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('box', {static: true})
  public box!: ElementRef<HTMLCanvasElement>;

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(private engServ: EngineService) {
  }

  ngOnInit(): void {
    this.listElementHTML.push(this.box);

    this.engServ.initialize(this.rendererCanvas, this.listElementHTML);
    this.engServ.animate();
  }

}
