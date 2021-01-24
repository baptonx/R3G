import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
  }

  ngAfterViewInit():void{
    
    console.log("ok")
    this.http.get<Array<string>>('/models/getAllNames' , {}).subscribe((returnedData: any) => console.log(returnedData));
    
}
}
