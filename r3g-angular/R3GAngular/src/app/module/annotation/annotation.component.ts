import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

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
