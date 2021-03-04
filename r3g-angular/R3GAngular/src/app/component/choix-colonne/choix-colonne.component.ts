import { Component, OnInit } from '@angular/core';
import {NodeCol} from "../node-colonne/node-colonne.component";


@Component({
  selector: 'app-choix-colonne',
  templateUrl: './choix-colonne.component.html',
  styleUrls: ['./choix-colonne.component.css']
})
export class ChoixColonneComponent implements OnInit {
  node: NodeCol = {
    name: 'Indeterminate',
    completed: false,
    children: [
      {name: 'Primary', completed: false, children: [
          {name: 'child1', completed: false, children: [
              {name: 'child11', completed: false},
              {name: 'child12', completed: false},
            ]},
          {name: 'child2', completed: false}
        ]},
      {name: 'Accent', completed: false},
      {name: 'Warn', completed: false}
    ]
  }
  allComplete: boolean = false;

  ngOnInit(): void {
  }



}
