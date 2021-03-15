import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TimelineService} from './timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  public canvas!: ElementRef<HTMLCanvasElement>;

  constructor(public timelineServ: TimelineService) {
  }

  ngOnInit(): void {
    this.timelineServ.initialize(this.canvas.nativeElement.getContext('2d'));
  }

}
