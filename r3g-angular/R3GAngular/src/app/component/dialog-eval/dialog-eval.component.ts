import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Model } from 'src/app/class/evaluation/model';
import { BddService } from 'src/app/service/bdd.service';
import { DialogData, DialogData2 } from '../apprentissage/apprentissage.component';
import { DialogCSVComponent } from '../dialog-csv/dialog-csv.component';

@Component({
  selector: 'app-dialog-eval',
  templateUrl: './dialog-eval.component.html',
  styleUrls: ['./dialog-eval.component.css']
})
export class DialogEvalComponent implements OnInit {
  model:Model;
  chargement:String='';
  sequences:Array<String>
  constructor(public http:HttpClient,public bdd: BddService,
    public dialogRef: MatDialogRef<DialogCSVComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData2) {
    this.model=data.model;
    this.sequences=data.sequences;
   }

  ngOnInit(): void {
  }

  eval():void{
    if(this.model!=null){
      this.chargement='Evaluation en cours, veuillez patienter.'
    this.http.get('/models/evaluation/'+this.bdd.bddnames+'/'+this.sequences+'/'+this.model).subscribe(
    (response: any) => {
      console.log(response)
      this.chargement='Evaluation terminée'
    },
    (error: any) => {
      console.log(error)
      this.chargement='Echec de l\'évaluation'
  });
    }
}
}