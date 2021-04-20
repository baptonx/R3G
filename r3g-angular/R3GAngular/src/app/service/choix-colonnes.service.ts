import { Injectable } from '@angular/core';
import {NodeCol} from "../component/node-colonne/node-colonne.component";
import {FormatDonnees} from "../class/exploration/format-donnees";
import {BddService} from "./bdd.service";
import {TableauExplService} from "./tableau-expl.service";

@Injectable({
  providedIn: 'root'
})
export class ChoixColonnesService {
  public node: NodeCol = {name: "root", path:"", completed: false, children: []};
  constructor(public bdd: BddService,public tablExpl: TableauExplService) {
    let str = localStorage.getItem("displayedColumns");
    if(str != null){
      this.node = JSON.parse(str);
      this.tablExpl.displayedColumns = this.selectionnes(this.node, '');
      this.tablExpl.observableColumns.next(this.tablExpl.displayedColumns);
    }
    this.bdd.observableSequences.subscribe((sequence) => {
      this.updateNodeFromBDD(this.bdd.formatSequence, this.node, "");
    })
  }

  public updateNodeFromBDD(formatSequence: FormatDonnees, node: NodeCol, path: string) {
    let estPresent: boolean = false;
    for (let child of formatSequence.children) {
      if(node.children != null) {
        for(let childNode of node.children) {
          if(childNode.name === child.value) estPresent = true;
        }
      }
      if(!estPresent) {
        if (!child.feuille()) {
          let childNode: NodeCol = {
            name: child.value,
            path: path + "." + formatSequence.value,
            completed: false,
            children: []
          };
          if (node.children != null) node.children.push(childNode);
          this.updateNodeFromBDD(child, childNode, path + "." + node.name);
        } else {
          if (node.children != null) node.children.push({
            name: child.value,
            path: path + "." + formatSequence.value,
            completed: false
          });
        }
      }
    }
  }


  //convertit l'abre de metadonnees en liste de string
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
}
