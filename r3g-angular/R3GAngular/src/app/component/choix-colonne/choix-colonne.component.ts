import {Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {NodeCol} from "../node-colonne/node-colonne.component";
import {BddService} from "../../service/bdd.service";
import {FormatDonnees} from "../../class/exploration/format-donnees";
import {element} from "protractor";
import {TableauExplService} from "../../service/tableau-expl.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ChoixColonnesService} from "../../service/choix-colonnes.service";


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

   // this.afficheDonnee = new Array<boolean>(this.donneesTabulees.length);
    //for(let i=0 ; i<this.donneesTabulees.length; i++) {
      //this.afficheDonnee[i] = false;
    //}
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
    this.dialogRef.close({colonnes: this.selectionnes(this.choixColService.node, '')})
  }

  nodeToTab(currentNode: NodeCol) : Array<NodeCol> {
    let tab = new Array<NodeCol>();
    if(currentNode.children == null) {
      return [currentNode];
    }
    for(let child of currentNode.children) {
      for(let item of this.nodeToTab(child)) {
        tab.push(item);
      }
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
          this.afficheDonnee[i] = (this.donneesTabulees[i].path + '.'+this.donneesTabulees[i].name).includes(word)?true:false;
          console.log(this.donneesTabulees[i].path + " and "+word+"          "+this.afficheDonnee[i])
        }
      }
    }
    else {
      console.log("undefined");
    }
  }

  selectLine(line: Array<string>) {
    let node: NodeCol = this.choixColService.node;
    let node2: NodeCol = node;
    for(let i=1 ; i<line.length ; i++) {
      if(node.children != null) {
        for (let child of node.children) {
          if(child.name === line[i]) {

          }
        }
      }
    }
  }

  setNode(line: NodeCol) {
    line.completed = !line.completed;
  }
}
