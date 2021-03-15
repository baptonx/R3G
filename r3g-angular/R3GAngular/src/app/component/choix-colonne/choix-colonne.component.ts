import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
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

  constructor(public bdd: BddService,
              public dialogRef: MatDialogRef<ChoixColonneComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { colonnes: string[] }) {}

  ngOnInit(): void {
    this.node = {name: 'root', completed: false, children: []};
    this.updateNodeFromBDD(this.bdd.formatSequence, this.node);
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
}
