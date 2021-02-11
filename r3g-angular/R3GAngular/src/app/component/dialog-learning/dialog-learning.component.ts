import { Component, OnInit } from '@angular/core';
import { HyperparameterBool } from 'src/app/class/evaluation/hyperparameter-bool';

@Component({
  selector: 'app-dialog-learning',
  templateUrl: './dialog-learning.component.html',
  styleUrls: ['./dialog-learning.component.css']
})
export class DialogLearningComponent implements OnInit {
  hyperpameters:any;

  constructor() { 
    
  }

  ngOnInit(): void {
  
  }


  openFile(event: { target: any; }) {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
        let reader = new FileReader();
        reader.onload = () => {
            // this 'text' is the content of the file
            this.hyperpameters = reader.result;
            console.log(this.hyperpameters);
          
        }
        reader.readAsText(input.files[index]);
    };
}
}