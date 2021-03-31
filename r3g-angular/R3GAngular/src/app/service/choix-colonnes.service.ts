import { Injectable } from '@angular/core';
import {NodeCol} from "../component/node-colonne/node-colonne.component";
import {FormatDonnees} from "../class/exploration/format-donnees";
import {BddService} from "./bdd.service";

@Injectable({
  providedIn: 'root'
})
export class ChoixColonnesService {
  public node: NodeCol = {name: "root", path:"", completed: false, children: []};
  constructor(public bdd: BddService,) {
    this.bdd.observableSequences.subscribe((sequence) => this.updateNodeFromBDD(this.bdd.formatSequence, this.node, ""))
  }

  public updateNodeFromBDD(formatSequence: FormatDonnees, node: NodeCol, path: string) {
    for(let child of formatSequence.children) {
      if(!child.feuille()){
        let childNode: NodeCol = {name: child.value, path:path+"."+formatSequence.value, completed: false, children: []};
        if(node.children != null) node.children.push(childNode);
        this.updateNodeFromBDD(child, childNode, path + "." + node.name);
      }
      else {
        if(node.children != null) node.children.push({name: child.value,path:path+"."+formatSequence.value, completed: false});
      }
    }
  }
}
