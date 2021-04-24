import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TimelineEvaluationService } from './timeline-evaluation.service';

@Component({
  selector: 'app-timeline-evaluation',
  templateUrl: './timeline-evaluation.component.html',
  styleUrls: ['./timeline-evaluation.component.css']
})
export class TimelineEvaluationComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  public canvas!: ElementRef<HTMLCanvasElement>;

  constructor(public timelineServ: TimelineEvaluationService) { }

  ngOnInit(): void {
    this.timelineServ.initialize(this.canvas.nativeElement.getContext('2d'));
  }

}
