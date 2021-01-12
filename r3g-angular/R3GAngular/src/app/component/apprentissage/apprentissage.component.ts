import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';



@Component({
  selector: 'app-apprentissage',
  templateUrl: './apprentissage.component.html',
  styleUrls: ['./apprentissage.component.css']
})
export class ApprentissageComponent implements OnInit {
  toppings = new FormControl();

  toppingList: string[] = ['Modèle 1','Modèle 2','Modèle 3'];
  constructor() { }

  ngOnInit(): void {
    
  }

}
