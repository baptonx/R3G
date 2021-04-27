import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';


export interface NodeCol{
  name: string;
  path: string;
  completed: boolean;
  children?: NodeCol[];
}


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


  someComplete(): boolean {
    if (this.node.children == null) {
      return false;
    }
 //   this.sendValues();
    return this.node.children.filter(t => t.completed).length > 0 && !this.node.completed;
  }

  setAll(completed: boolean): void {
    this.setAllNode(completed, this.node);
    this.sendValues(completed);
  }

  setAllNode(completed: boolean, node: NodeCol): void {
    node.completed = completed;
    if (node.children != null) {
      node.children.forEach(t => this.setAllNode(completed, t));
    }
  }

  sendValues(completed: boolean): void {
    if (completed) {
      this.childTrue.emit(this.node.name);
    }
    else{
      this.childFalse.emit(this.node.name);
    }
  }

  onChildFalse(name: string): void {
    this.node.completed = false;
    if (this.node.children != null) {
      let noneSelected = true;
      for (let i = 0; i < this.node.children.length; i++) {
        noneSelected = noneSelected && !this.node.children[i].completed;
      }
      if (noneSelected) {
        console.log('allSelected');
        this.setAll(false);
      }
    }
  }

  onChildTrue(name: string): void {
    if (this.node.children != null) {
      let allSelected = true;
      for (let i = 0; i < this.node.children.length; i++) {
        allSelected = allSelected && this.node.children[i].completed;
      }
      if (allSelected) {
        console.log('allSelected');
        this.setAll(true);
      }
    }
  }
}
