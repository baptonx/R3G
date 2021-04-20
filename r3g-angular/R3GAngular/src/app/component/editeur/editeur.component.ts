import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BddService } from 'src/app/service/bdd.service';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.css']
})
export class EditeurComponent implements OnInit {
  isLinear = false;
  classeGeste:Array<String>=[];

  constructor(public http:HttpClient,public bdd:BddService) {}

  ngOnInit() {
    this.http.get<Array<String>>('/models/getClasses/'+this.bdd.bddnames,{}).subscribe((returnedData: Array<String>) => this.classeGeste = returnedData);
  }

  ngAfterInit(){
    
  }
}