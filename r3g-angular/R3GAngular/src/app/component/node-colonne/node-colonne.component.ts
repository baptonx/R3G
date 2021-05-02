import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {NodeCol} from '../../class/exploration/node-col-impl';


// export interface NodeCol{
//   name: string;
//   path: string;
//   completed: boolean;
//   children?: NodeCol[];
// }


@Component({
  selector: 'app-node-colonne',
  templateUrl: './node-colonne.component.html',
  styleUrls: ['./node-colonne.component.css']
})
export class NodeColonneComponent implements OnInit {
  @Input() public node!: NodeCol;
  @Output() childTrue: EventEmitter<string> = new EventEmitter<string>();
  @Output() childFalse: EventEmitter<string> = new EventEmitter<string>();
  public show = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  // Vrai ssi au moin une case est cochee mais pas toutes
  someComplete(): boolean {
    if (this.node.children == null) {
      return false;
    }
    return this.node.children.filter(t => t.completed).length > 0 && !this.node.completed;
  }

  // Vrai ssi toutes les cases sont cochees
  setAll(completed: boolean): void {
    this.setAllNode(completed, this.node);
    this.sendValues(completed);
  }
  // Coche toutes les cases
  setAllNode(completed: boolean, node: NodeCol): void {
    node.completed = completed;
    if (node.children != null) {
      node.children.forEach(t => this.setAllNode(completed, t));
    }
  }
  // envoie aux noeud fils la consigne de tout selectionner ou deselectionner
  sendValues(completed: boolean): void {
    if (completed) {
      this.childTrue.emit(this.node.name);
    }
    else{
      this.childFalse.emit(this.node.name);
    }
  }

  // deselectionne le noeud et tous ses fils
  onChildFalse(): void {
    this.node.completed = false;
    if (this.node.children != null) {
      let noneSelected = true;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.node.children.length; i++) {
        noneSelected = noneSelected && !this.node.children[i].completed;
      }
      if (noneSelected) {
        this.setAll(false);
      }
    }
  }

  // selectionne le noeud et tous ses fils
  onChildTrue(): void {
    if (this.node.children != null) {
      let allSelected = true;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.node.children.length; i++) {
        allSelected = allSelected && this.node.children[i].completed;
      }
      if (allSelected) {
        this.setAll(true);
      }
    }
  }
}
