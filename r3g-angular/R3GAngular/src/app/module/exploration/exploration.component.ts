import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatInput} from '@angular/material/input';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})


export class ExplorationComponent implements OnInit, AfterViewInit {
  selectedSeq: Array<string>; // Contient les indices des séquences sélectionnées
  @ViewChild('inputFiltre') inputFiltre!: MatInput;
  picker = document.getElementById('picker');
  listing = document.getElementById('listing');
  constructor(private http: HttpClient) {
    this.selectedSeq = ['sequence 1', 'sequence 2', 'sequence 3', 'sequence 4', 'sequence 5', 'sequence 6', 'sequence 7', 'sequence 8', 'sequence 9', 'sequence 10'];
  }

  ngOnInit(): void {
    /*// @ts-ignore
    this.picker.addEventListener('change', e => {
      // @ts-ignore
      for (const file of Array.from(e.target.files)) {
        const item = document.createElement('li');
        // @ts-ignore
        item.textContent = file.webkitRelativePath;
        // @ts-ignore
        listing.appendChild(item);
      }
    });*/
  }
  deleteSeq(i: number): void{
    this.selectedSeq.splice(i, 1);
  }

  ngAfterViewInit(): void {
    this.http.get<Array<string>>('/models/getMetaData' , {}).subscribe((returnedData: any) => console.log(returnedData));
  }

}
