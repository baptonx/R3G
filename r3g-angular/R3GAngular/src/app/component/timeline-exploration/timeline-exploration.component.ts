import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TimelineService} from '../timeline/timeline.service';
import {TimelineExplorationService} from './timeline-exploration.service';

@Component({
  selector: 'app-timeline-exploration',
  templateUrl: './timeline-exploration.component.html',
  styleUrls: ['./timeline-exploration.component.css']
})
export class TimelineExplorationComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  public canvas!: ElementRef<HTMLCanvasElement>;

  constructor(public timelineServ: TimelineExplorationService) { }

  ngOnInit(): void {
    this.timelineServ.initialize(this.canvas.nativeElement.getContext('2d'));
  }

}
