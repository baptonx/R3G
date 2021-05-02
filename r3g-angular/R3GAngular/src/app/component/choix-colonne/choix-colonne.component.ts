import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {BddService} from '../../service/bdd.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ChoixColonnesService} from '../../service/choix-colonnes.service';
import {NodeCol} from '../../class/exploration/node-col-impl';


@Component({
  selector: 'app-choix-colonne',
  templateUrl: './choix-colonne.component.html',
  styleUrls: ['./choix-colonne.component.css']
})
export class ChoixColonneComponent implements OnInit {

  donneesTabulees: Array<NodeCol> = new Array<NodeCol>();
  afficheDonnee: Array<boolean> = new Array<boolean>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(public bdd: BddService,
              public dialogRef: MatDialogRef<ChoixColonneComponent>,
              public choixColService: ChoixColonnesService,
              @Inject(MAT_DIALOG_DATA) public data: { colonnes: string[] }) {}

  ngOnInit(): void {
    this.donneesTabulees = this.nodeToTab(this.choixColService.node);
  }


  // ferme la fenetre de dialogue en envoyant les noms des noeuds choisis
  sendColonnesChoisies(): void {
    this.dialogRef.close({colonnes: this.choixColService.selectionnes(this.choixColService.node, '')});
    localStorage.setItem('displayedColumns', JSON.stringify(this.choixColService.node));
  }

  // Renvoie toutes les feuilles accessibles a partir d'un noeud
  nodeToTab(currentNode: NodeCol): Array<NodeCol> {
    const tab = new Array<NodeCol>();
    if (currentNode.children == null) {
      return [currentNode];
    }
    for (const child of currentNode.children) {
      for (const item of this.nodeToTab(child)) {
        tab.push(item);
      }
    }
    return tab;
  }

  // afficher les donnees correspondantes dans la barre de recherche
  afficherDonneees(): void {
    const word = this.searchInput.nativeElement.value;
    if (word !== undefined) {
      if (word === '') {
        for (let i = 0 ; i < this.donneesTabulees.length; i++) {
          this.afficheDonnee[i] = false;
        }
      }
      else {
        for (let i = 0; i < this.donneesTabulees.length; i++) {
          this.afficheDonnee[i] = (this.donneesTabulees[i].path + '.' + this.donneesTabulees[i].name).includes(word) ? true : false;
        }
      }
    }
  }

  // selectLine(line: Array<string>): void {
  //   let node: NodeCol = this.choixColService.node;
  //   for(let i = 1 ; i < line.length ; i++) {
  //     if(node.children != null) {
  //       for (const child of node.children) {
  //         if (child.name === line[i]) {
  //
  //         }
  //       }
  //     }
  //   }
  // }

  // Modifie la selection du noeud
  setNode(line: NodeCol): void {
    line.completed = !line.completed;
  }
}
