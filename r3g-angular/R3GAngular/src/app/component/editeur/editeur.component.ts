import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AnnotationService } from 'src/app/module/annotation/annotation.service';
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
  bdd_selected:string="";
  geste:string="";
  dataSource!: MatTableDataSource<String>;
  displayedColumns=['Geste','Couleur']
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public http:HttpClient,public bdd:BddService, public annotation: AnnotationService) {
    this.bdd.listGesteBDD.forEach((value: String[], key: String) => {
      value.forEach(elt=>{
        this.classeGeste.push(elt)
      })
  });
    for(var i=0;i<this.classeGeste.length;i++){
    let Col=localStorage.getItem(this.classeGeste[i].toString());
    if(Col!=null){  //  it checks values here or not to the variable
       this.couleur.push(Col)
       this.annotation.geste_couleur.set(this.classeGeste[i].toString(),Col)
    }
    else{
      this.couleur.push('')
    }

    }
    this.dataSource = new MatTableDataSource<String>(this.classeGeste);
    console.log(this.dataSource);
    console.log(this.couleur)
  }

  changeValue(value:any){
    this.bdd.bddnames.forEach(elt =>{
        if(elt==value){
          this.bdd_selected=elt
          console.log(this.bdd_selected)
          console.log(this.bdd.listGesteBDD)
        }
    }
    )
  }

  changeVal(event: any, i:number):void{
    this.couleur[i]=event.target.value
    this.geste = this.classeGeste[i].toString();
    localStorage.setItem(this.geste,event.target.value)
    this.annotation.geste_couleur.set(this.geste,event.target.value)
    console.log(this.annotation.geste_couleur)
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
