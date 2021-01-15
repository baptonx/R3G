import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})

export class ExplorationComponent implements OnInit {
  constructor() { }
  showFiller = false;

  ngOnInit(): void {
  }
}
