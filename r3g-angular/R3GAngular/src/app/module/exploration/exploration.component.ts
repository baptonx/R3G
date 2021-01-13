import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})

export class ExplorationComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  toAnnotation(): void{
    this.router.navigate(['annotation']).then();
  }
  toExploration(): void{
    this.router.navigate(['exploration']).then();

  }
  toEvaluation(): void{
    this.router.navigate(['evaluation']).then();
  }
}
