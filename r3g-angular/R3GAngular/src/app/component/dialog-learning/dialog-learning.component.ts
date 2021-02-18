import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { HyperparameterBool } from 'src/app/class/evaluation/hyperparameter-bool';

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

  constructor(private _formBuilder: FormBuilder, public http:HttpClient) {
    this.fileCSVName="Hyperparamètres";
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
    this.chooseSequence();
    if(this.file!=undefined){
    const formData: FormData = new FormData();
    formData.append('file', this.file, this.file.name);
    var name=this.modelName?.nativeElement.value!
    this.http.post('/models/uploadFile/'+name,formData).subscribe(
      (response: any) => {
          console.log(response)
      },
      (error: any) => {
          console.log(error)
      });
    }
  }

  chooseSequence(){
    let csvContent = "data:text/csv;charset=utf-8," 
    +("Sequence1\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    document.body.appendChild(link); 
    console.log(link);
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
}