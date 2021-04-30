import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EngineService} from './engine.service';
import {MatButtonToggle} from '@angular/material/button-toggle';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css'],
  providers: [EngineService]
})
export class EngineComponent implements OnInit, OnDestroy {

  // https://discoverthreejs.com/book/first-steps/animation-system/
  // https://www.programmersought.com/article/14865706774/
  // https://blog.angular-university.io/how-does-angular-2-change-detection-really-work/

  // Pouvoir créer une nouvelle annotation
  // Pouvoir modifier la taille des annot avec la souris
  // Clean le code de explorationService
  // Afficher consignes d'acquisition + IA (choisir IA + annoter avec IA + recopier IA vers vérité terrain)
  // Quand recopie IA, réinitialiser AnnotCurrent
  // Pouvoir sauvegarder
  // Mettre l'ia -> Récupérer un tableau d'annotation à afficher
  // Bouton pour recopier liste annotation IA dans liste annotation de la séquence
  // --> Créer des nouveaux gestes


  showFiller = false;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('box', {static: true})
  public box!: ElementRef<HTMLCanvasElement>;

  @ViewChild('buttonModeEditing', { static: true })
  public buttonModeEditing!: MatButtonToggle;

  @ViewChild('buttonModeAnnotation', { static: true })
  public buttonModeAnnotation!: MatButtonToggle;

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(public engServ: EngineService) {
  }

  ngOnInit(): void {
    this.listElementHTML.push(this.box);
    this.engServ.initialize(this.rendererCanvas, this.listElementHTML, false, undefined);
    this.buttonModeEditing.checked = true;
    this.engServ.annotationServ.buttonModeEditing = this.buttonModeEditing;
    this.engServ.annotationServ.buttonModeAnnotation = this.buttonModeAnnotation;
    this.engServ.animate();
  }

  ngOnDestroy(): void {
    this.engServ.annotationServ.sequenceCurrent = undefined;
  }

  updateActionTime(event: any): void {
    this.engServ.updateActionTime(event);
  }

  updateActionFrame(event: any): void {
    this.engServ.updateActionFrame(event);
  }

  updateSizeCube(event: any): void {
    this.engServ.updateSizeCube(event);
  }

  updateTimeScale(event: any): void {
    this.engServ.updateTimeScale(event);
  }

}
