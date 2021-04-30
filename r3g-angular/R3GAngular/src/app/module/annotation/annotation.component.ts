import { Component, OnInit } from '@angular/core';
import {AnnotationService} from './annotation.service';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.css']
})
export class AnnotationComponent implements OnInit {

  constructor(public annotationService: AnnotationService) {
  }

  ngOnInit(): void {
  }

  sauvegarder(): void {
    this.annotationService.sauvegardeAnnotation();
  }
}
