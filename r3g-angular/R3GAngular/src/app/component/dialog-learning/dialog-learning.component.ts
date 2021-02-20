import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { HyperparameterBool } from 'src/app/class/evaluation/hyperparameter-bool';
import { SequencesChargeesService } from 'src/app/service/sequences-chargees.service';


@Component({
  selector: 'app-dialog-learning',
  templateUrl: './dialog-learning.component.html',
  styleUrls: ['./dialog-learning.component.css']
})
export class DialogLearningComponent implements OnInit {
  @ViewChild('modelName') 
  modelName:ElementRef<MatInput> | undefined
  hyperpameters:any;
  fileCSVName:string;
  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  file:File | undefined;
  isManual:boolean;
  isCrossVal:boolean;
  isProtocole:boolean

  constructor(private _formBuilder: FormBuilder, public http:HttpClient,public serviceSeq:SequencesChargeesService,public dialog:MatDialog) {
    this.fileCSVName="Hyperparamètres";
    this.isManual=false;
    this.isCrossVal=false;
    this.isProtocole=false;
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  ngAfterViewInit():void{


    this.startLearning();


  }

  
  startLearning(){
    if(this.file!=undefined){
    const formData: FormData = new FormData();
    formData.append('file', this.file, this.file.name);
    var name=this.modelName?.nativeElement.value!
    this.http.post('/models/uploadFile/'+name,formData).subscribe(
      (response: any) => {
          console.log(response)
          let fileSeq=this.chooseSequence();
          const sequences: FormData = new FormData();
          sequences.append('file', fileSeq, fileSeq.name);
          this.http.post('/models/uploadFile/'+name,sequences).subscribe(
            (response: any) => {
                console.log(response)
            },
            (error: any) => {
                console.log(error)
            });
      },
      (error: any) => {
          console.log(error)
      });

   
    }
  }

  chooseSequence():File{
    let csvContent = "data:text/csv;charset=utf-8," 
    +("Sequence1\n");
    let train=['Train\n']
    let test=['\n','Test\n']
    this.serviceSeq.sequences.forEach(seq=>{
      if(seq.isTrain){
        train.push(seq.id)
        train.push(';')
      }
      else{
        test.push(seq.id)
        test.push(';')
      }
    })
    let file = new File(train.concat(test), 'hello_world.txt', {type: 'text/plain'});
    return file
  }
  


  openFile(event: { target: any; }) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
        let reader = new FileReader();
        console.log(event.target.name)
        reader.onload = () => {
            // this 'text' is the content of the file
            this.hyperpameters = reader.result;
            this.file=event.target.files.item(0)
          
        }
       
        reader.readAsText(input.files[index]);
        this.fileCSVName=input.files[index].name;
    };
}

changeMode(i:number):void{
  switch(i){
    case 1:
      this.isManual=false;
      this.isProtocole=true;
      this.isCrossVal=false;
      break;
    case 2:
      this.isManual=true;
      this.isProtocole=false;
      this.isCrossVal=false;
      break;
    case 3:
      this.isManual=false;
      this.isProtocole=false;
      this.isCrossVal=true;
      break;

  }
}



}