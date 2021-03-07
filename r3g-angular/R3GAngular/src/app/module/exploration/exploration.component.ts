import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatInput} from '@angular/material/input';
import {BddService} from '../../service/bdd.service';
import {VisualisationExploService} from '../../service/visualisation-explo.service';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})


export class ExplorationComponent implements OnInit, AfterViewInit {
  @ViewChild('inputFiltre') inputFiltre!: MatInput;
  picker = document.getElementById('picker');
  listing = document.getElementById('listing');

  constructor(public bdd: BddService, public visuService: VisualisationExploService) {
  }

  ngOnInit(): void {
  }
  /*
  importBase(): void{

    // @ts-ignore
    picker.addEventListener('change', e => {
      // @ts-ignore
      for (const file of Array.from(e.target.files)) {
        const item = document.createElement('li');
        // @ts-ignore
        item.textContent = file.webkitRelativePath;
        // @ts-ignore
        listing.appendChild(item);
      }
    });
  }*/

  ngAfterViewInit(): void {
    this.bdd.setMetaData();
  }

}
