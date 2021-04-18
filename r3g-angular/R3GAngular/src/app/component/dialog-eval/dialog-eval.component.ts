import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  model:Model;
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
    this.http.get('/models/evaluation/'+this.bdd.bddnames+'/'+this.sequences+'/'+this.model).subscribe(
    (response: any) => {
      console.log(response)
      this.chargement='Evaluation terminée'
      this.sequencesChargees.evaluation=response;
    },
    (error: any) => {
      console.log(error)
      this.chargement='Echec de l\'évaluation'
  });
    }
}
}