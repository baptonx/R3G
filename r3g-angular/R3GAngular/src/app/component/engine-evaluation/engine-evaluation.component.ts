import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

  changeFilter(value: any): void {
    this.engServ.filtreSelected = value;
  }
  changeSeq(value: any): void{
    this.engServ.sequences.forEach(seq => {
      if (seq.id === value){
        this.engServ.sequenceCurrent = seq;
        this.engServ.refreshInitialize();
      }
    });
  }
  view(): void{
    if (this.engServ.modelSelected !== undefined && this.engServ.layerSelected !== undefined
    && this.engServ.filtreSelected !== undefined){
      this.engServ.initPoids(undefined, undefined, true);
    }
  }

  play(): void{
    this.engServ.playSeq();
  }

  getPoids(): void {
    if (this.engServ.modelSelected !== undefined) {
      this.engServ.layerSelected = '';
      this.engServ.filtreSelected = '';
      this.engServ.initPoids(undefined, undefined, true);
      this.http.get<Array<Poids>>('/models/getPoids/' + this.engServ.modelSelected).subscribe(
        (returnedData: Array<Poids>) => {
          this.engServ.poids = returnedData;
          console.log(returnedData);
          this.engServ.poids.forEach(elem => {
            this.engServ.layerList.add(elem.name);
          });
        },
        () => {

        });
    }
  }

  changeModel(value: any): void{
    this.engServ.modelSelected = value;
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
}
