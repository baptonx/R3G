import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EngineService} from './engine.service';
import {MatSlider} from '@angular/material/slider';
import {MatButtonToggle, MatButtonToggleAppearance} from '@angular/material/button-toggle';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css'],
  providers: [EngineService]
})
export class EngineComponent implements OnInit {

  // --> Visualiser les annotations des séquences
  // Sélection d'une annotation
  // Afficher les informations dans l'éditeur textuel
  // Pouvoir modifier les annotations des séquences à la main et avec l'éditeur textuel (faire attention à l'ordre des listes !)
  // Pouvoir créer une nouvelle annotation
  // Pouvoir sauvegarder
  // Mettre l'ia -> Récupérer un tableau d'annotation à afficher
  // Bouton pour recopier liste annotation IA dans liste annotation de la séquence
  // Evaluation pareil : liste d'annotation à afficher mais bloquer la modification 
  // (booléen mode évaluation à true et reviens à false quand on quitte le module)




  // https://discoverthreejs.com/book/first-steps/animation-system/
  // https://www.programmersought.com/article/14865706774/
  // https://blog.angular-university.io/how-does-angular-2-change-detection-really-work/
  // Chaque cube a son animation qui est joué
  // Quand on fait pause ou reset, on boucle sur tous les cubes.
  // Problème que l'on peut rencontrer : les cubes vont-ils être synchronisé ? Et niveau performance ?
  // Problème : fichier d'enregistrement contient des blancs ?
  // Données en entrée : Pour chaque articulation => positions à un instant t
  // idées : mettre des sphères à la place des cubes ? et relier les sphères entre elles ?
  // Pour timeline : regarder si on peut mettre l'action a un temps t, si oui faire une timeline qui set
  // toutes les actions au temps t du curseur.


  // Faire une classe qui regroupe toutes les sphères
  // Utiliser les attributs pour bouger les sphères (donc que une animation sur cette classe)
  // NomClasse.sphere1.transform ... (changer sphere1 par nom de l'articulation)

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
