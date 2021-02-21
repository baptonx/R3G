import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisualisationExploService {
  componentHidden: boolean
  constructor() {
    this.componentHidden = true;
  }

  show(): void{
    this.componentHidden = false;
  }
  hide(): void{
    this.componentHidden = true;
  }
}
