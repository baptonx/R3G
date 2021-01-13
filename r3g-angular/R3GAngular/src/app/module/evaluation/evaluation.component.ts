import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {

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
