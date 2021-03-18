import {Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {NodeCol} from "../node-colonne/node-colonne.component";
import {BddService} from "../../service/bdd.service";
import {FormatDonnees} from "../../class/exploration/format-donnees";
import {element} from "protractor";
import {TableauExplService} from "../../service/tableau-expl.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";


@Component({
  selector: 'app-choix-colonne',
  templateUrl: './choix-colonne.component.html',
  styleUrls: ['./choix-colonne.component.css']
})
export class ChoixColonneComponent implements OnInit {
  node: NodeCol = {name: "undefined", completed: false};
  donneesTabulees: Array<Array<string>> = new Array<Array<string>>();
  afficheDonnee: Array<boolean> = new Array<boolean>();
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(public bdd: BddService,
              public dialogRef: MatDialogRef<ChoixColonneComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { colonnes: string[] }) {}

  ngOnInit(): void {
    this.node = {name: 'root', completed: false, children: []};
    this.updateNodeFromBDD(this.bdd.formatSequence, this.node);
    this.donneesTabulees = this.nodeToTab(this.node,[]);
    this.afficheDonnee = new Array<boolean>(this.donneesTabulees.length);
    for(let i=0 ; i<this.donneesTabulees.length; i++) {
      this.afficheDonnee[i] = false;
    }
  }


  private updateNodeFromBDD(formatSequence: FormatDonnees, node: NodeCol) {
    for(let child of formatSequence.children) {
      if(!child.feuille()){
        let childNode: NodeCol = {name: child.value, completed: false, children: []};
        if(node.children != null) node.children.push(childNode);
        this.updateNodeFromBDD(child, childNode);
      }
      else {
        if(node.children != null) node.children.push({name: child.value, completed: false});
      }
    }
  }

  selectionnes(node: NodeCol, path: string): string[] {
    if((node.children == null || node.children.length === 0) && !node.completed) {
      return [];
    }
    let tab: string[] = [];
    let newTab: string[];
    if(node.children != null) {
      for(let child of node.children) {
        newTab = this.selectionnes(child,path === ''?child.name:path + "." + child.name);
        newTab.forEach((element) => tab.push(element));
        tab.concat(newTab);
      }
      return tab;
    }
    return [path];
  }

  sendColonnesChoisies(): void {
    this.dialogRef.close({colonnes: this.selectionnes(this.node, '')})
  }

  nodeToTab(currentNode: NodeCol, initialPath: Array<string>) : Array<Array<string>> {
    let tab = new Array<Array<string>>();
    if(currentNode.children == null) {
      let tab2 = initialPath.slice();
      tab2.push(currentNode.name);
      tab.push(tab2);
      return tab;
    }
    for(let child of currentNode.children) {
      initialPath.push(currentNode.name);
      for(let item of this.nodeToTab(child,initialPath)) {
        tab.push(item);
      }
      initialPath.pop();
    }
    return tab;
  }

  afficherDonneees(event: any) {

    let word = this.searchInput.nativeElement.value;
    console.log(word);
    if(word !== undefined) {
      if(word === "") {
        for(let i=0 ; i<this.donneesTabulees.length; i++) {
          this.afficheDonnee[i] = false;
        }
      }
      else {
        for(let i=0; i<this.donneesTabulees.length; i++) {
          console.log(word)
          this.afficheDonnee[i] = this.donneesTabulees[i].join(".").includes(word)?true:false;
          console.log(this.donneesTabulees[i].join(".") + " and "+word+"          "+this.afficheDonnee[i])
        }
      }
    }
    else {
      console.log("undefined");
    }
  }
}
