import {Component, OnInit, ViewChild} from '@angular/core';
import {VisualisationExploService} from "../../service/visualisation-explo.service";


@Component({
  selector: 'app-visualitation-explo',
  templateUrl: './visualitation-explo.component.html',
  styleUrls: ['./visualitation-explo.component.css']
})
export class VisualitationExploComponent implements OnInit {
  isResizing: boolean=false;
  y: number = 0;
  height: number = 300;
  constructor(public serviceVisu: VisualisationExploService) { }

  ngOnInit(): void {
  }

  mousedown($event: MouseEvent) {
    console.log("mousedown");
    console.log(this.isResizing);
    this.isResizing = true;
    this.y = $event.clientY;

    document.addEventListener("mousemove", this.resize, false);
    document.addEventListener("mouseup",this.mouseUp, false);
  }

  mouseUp(event: MouseEvent) {
    this.isResizing = false;
    console.log("mouseUp");
    console.log(this.isResizing);
    document.removeEventListener("mousemove",this.resize);
    document.removeEventListener("mouseup",this.mouseUp);
    event.preventDefault();
  }

  resize(event: MouseEvent) {
    console.log("resize");
    console.log(this.isResizing);
    if(this.isResizing){
      console.log("should resize");
      this.height += (this.y-event.clientY);
      event.preventDefault();
    }
  }
}
