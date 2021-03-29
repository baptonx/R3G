import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EngineService} from "./engine.service";
import {MatSlider} from '@angular/material/slider';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css'],
  providers: [EngineService]
})
export class EngineComponent implements OnInit {

  // Améliorer la timeline : deplacer curseur que quand on est dessus avec curseur souris qui change
  // Afficher temps (en minute/seconde et en frame) directement dans canvas (+ facile pour actualisation)
  // Mettre un editText qui permet de se mettre exactement ou l'on veut sur la timeline (en seconde et en frame)
  // Afficher sur la timeline une barre temporelle en haut
  // Mettre les boutons play/pause/stop au bon endroits
  // Bouton reset la caméra !
  // Mettre les autres panels etc ... pour la structure
  // Jouer la vrai animation squelette
  // Commencer à créer des annotations ?




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

  public listElementHTML: Array<ElementRef<HTMLCanvasElement>> = [];

  constructor(public engServ: EngineService) {
  }

  ngOnInit(): void {
    this.listElementHTML.push(this.box);
    this.engServ.initialize(this.rendererCanvas, this.listElementHTML);
    this.engServ.animate();
  }

  updateActionTime(event: any): void {
    this.engServ.updateActionTime(event);
  }

}
