import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Annotation } from 'src/app/class/commun/annotation/annotation';
import { Eval } from 'src/app/class/evaluation/eval';
import { Model } from 'src/app/class/evaluation/model';
import { BddService } from 'src/app/service/bdd.service';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';
import { DialogData, DialogData2 } from '../apprentissage/apprentissage.component';
import { DialogCSVComponent } from '../dialog-csv/dialog-csv.component';

@Component({
  selector: 'app-dialog-eval',
  templateUrl: './dialog-eval.component.html',
  styleUrls: ['./dialog-eval.component.css']
})
export class DialogEvalComponent implements OnInit {
  model:String='';
  chargement:String='';
  sequences:Array<String>=[];
  constructor(public http:HttpClient,public bdd: BddService,public sequencesChargees:SequencesChargeesService,
    public dialogRef: MatDialogRef<DialogCSVComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData2) {
    this.model=data.model;
    sequencesChargees.sequences.forEach(elt =>{
      this.sequences.push(elt.id)
    })
   }

  ngOnInit(): void {
    console.log(this.sequencesChargees.sequences)
  }

  eval():void{
    if(this.model!=null){
      this.chargement='Evaluation en cours, veuillez patienter.'
    this.http.get<Array<Eval>>('/models/evaluation/'+this.bdd.bddnames+'/'+this.sequences+'/'+this.model).subscribe(
      (returnedData: Array<Eval>) =>{
        this.sequencesChargees.evaluation = returnedData;
        this.chargement='Evaluation terminée'
        console.log(this.sequencesChargees.evaluation)

      },
      (error: any) => {
        console.log(error)
        this.chargement='Echec de l\'évaluation'
    });
    }
}
}