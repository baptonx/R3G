import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HyperparameterBool } from 'src/app/class/evaluation/hyperparameter-bool';

@Component({
  selector: 'app-dialog-learning',
  templateUrl: './dialog-learning.component.html',
  styleUrls: ['./dialog-learning.component.css']
})
export class DialogLearningComponent implements OnInit {
  hyperpameters:any;
  fileCSV:string;
  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    this.fileCSV="Hyperparamètres";
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }
  


  openFile(event: { target: any; }) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
        let reader = new FileReader();
        console.log(event.target.name)
        reader.onload = () => {
            // this 'text' is the content of the file
            this.hyperpameters = reader.result;
            console.log(this.hyperpameters);
          
        }
       
        reader.readAsText(input.files[index]);
        this.fileCSV=input.files[index].name;
    };
}
}