import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BddService } from 'src/app/service/bdd.service';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.css']
})
export class EditeurComponent implements OnInit {
  isLinear = false;
  classeGeste:Array<String>=[];
  couleur:Array<String>=[];
  dataSource!: MatTableDataSource<String>;
  displayedColumns=['Geste','Couleur']
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public http:HttpClient,public bdd:BddService) {
    this.classeGeste=this.bdd.classesGestes;
    this.classeGeste.forEach(elt=>{
      this.couleur.push('blue')
    })
    this.dataSource = new MatTableDataSource<String>(this.classeGeste);
    console.log(this.dataSource);
  }

  changeVal(event: any, i:number):void{
    this.couleur[i]=event.target.value
}

  saveColor():void{
    console.log(this.couleur)
  }

  ngOnInit() {

  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
  }
}
