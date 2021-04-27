import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatInput} from '@angular/material/input';
import {BddService} from 'src/app/service/bdd.service';
import {Sequence} from '../../class/commun/sequence';


@Component({
  selector: 'app-dialog-learning',
  templateUrl: './dialog-learning.component.html',
  styleUrls: ['./dialog-learning.component.css']
})
export class DialogLearningComponent implements OnInit {
  @ViewChild('modelName')
  modelName: ElementRef<MatInput> | undefined;
  @ViewChild('pathIA')
  pathIA: ElementRef<MatInput> | undefined;
  hyperpameters: any;
  fileCSVName: string;
  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  file: File | undefined;

  constructor(private formBuilder: FormBuilder, public http: HttpClient, public bdd: BddService, public dialog: MatDialog) {
    this.fileCSVName = 'Hyperparamètres';
  }

  ngOnInit(): void {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  ngAfterInit(): void {
    this.startLearning();
  }


  startLearning(): void {
    if (this.file !== undefined) {
      const formData: FormData = new FormData();
      formData.append('file', this.file, this.file.name);
      if (this.modelName !== undefined) {
        const name = this.modelName.nativeElement.value;
        this.http.post('/models/uploadFile/' + name, formData).subscribe(
        () => {
          const fileSeq = this.chooseSequence();
          const sequences: FormData = new FormData();
          sequences.append('file', fileSeq, fileSeq.name);
          this.http.post('/models/uploadFile/' + name, sequences).subscribe(
            () => {

              const ia = this.chooseIA();
              const iaFile: FormData = new FormData();
              iaFile.append('file', ia, ia.name);
              this.http.post('/models/uploadFile/' + name, {}).subscribe(
                () => {

                  this.http.get('/models/startLearning/' + name, {}).subscribe(
                    () => {
                    },
                    () => {
                    }
                  );
                },
                () => {
                });
            },
            () => {
            });
        },
        () => {
        });

    }}
  }

  chooseSequence(): File {
    const train = ['Train\n'];
    const test = ['\n', 'Test\n'];
    (Array.from(this.bdd.mapSequences.values()).reduce((acc, elem) => acc.concat(elem), []))
      .forEach((seq: Sequence) => {
        if (seq.isTrain) {
          train.push(seq.id);
          train.push(';');
        } else {
          test.push(seq.id);
          test.push(';');
        }
      });
    if (test.length > 1) {
      test.pop();
    }
    if (train.length > 1) {
      train.pop();
    }
    return new File(train.concat(test), 'sequences.txt', {type: 'text/plain'});
  }


  chooseIA(): File {
    const ia = [];
    if (this.pathIA !== undefined) {
      ia.push(this.pathIA.nativeElement.value);
    }
    return new File(ia, 'ia.txt', {type: 'text/plain'});
  }


  openFile(event: { target: any; }): void {
    const input = event.target;
    input.files.forEach((f: any) => {
      const reader = new FileReader();
      reader.onload = () => {
        // this 'text' is the content of the file
        this.hyperpameters = reader.result;
        this.file = event.target.files.item(0);

      };

      reader.readAsText(f);
      this.fileCSVName = f.name;
    });
  }
}

