import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { DialogData } from '../apprentissage/apprentissage.component';

@Component({
  selector: 'app-dialog-csv',
  templateUrl: './dialog-csv.component.html',
  styleUrls: ['./dialog-csv.component.css']
})
export class DialogCSVComponent implements OnInit {
  @ViewChild('fileName')
  fileName: ElementRef<MatInput> | undefined;
  @ViewChild('subFolder')
  subFolder: ElementRef<MatInput> | undefined;
  @ViewChild('pathWeight')
  pathWeight: ElementRef<MatInput> | undefined;
  list: Array<Array<string>>;



  constructor(
    public dialogRef: MatDialogRef<DialogCSVComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.list = [];
   }

  ngOnInit(): void {

  }


  // Remplissage de la liste, avec gestion des combinaisons souhaitées
  fillList(): void{
    this.data.orderVal.forEach(i => {

      if (i <= 15){
        const elt = this.data.hyperparametersNumber[i].value;
        console.log(elt);
        if ( elt.includes(',') && !elt.includes('[')){
          this.list.push(this.toList(elt));
        }
        else{
          const tmp = [];
          tmp.push(elt);
          this.list.push(tmp);
        }
      }
      else{
        const eltList = this.data.hyperparametersBool[i - 16].value;
        this.list.push(eltList);

        }
    });

  }

  // Permet de modifier le nom pour chaque élément de la grande liste, afin qu'il match avec le csv type de william
  changeName(): void{


      for (let i = 0; i < this.list.length; i++){
      for (let j = 0; j < this.list[i].length; j++){
      if (this.data.orderVal[i] <= 15) {
        this.list[i][j] = this.data.hyperparametersNumber[this.data.orderVal[i]].name + '=' + this.list[i][j];
      }
      else{
        console.log(this.data.hyperparametersBool[this.data.orderVal[i] - 16]);
        this.list[i][j] = this.data.hyperparametersBool[this.data.orderVal[i] - 16].name + '=' + this.list[i][j];
      }
    }
    }

      const folder = this.subFolder?.nativeElement.value!;
      const path = this.pathWeight?.nativeElement.value!;
      if (folder !== ''){
        this.list.push(['FolderFit=' + folder]);
    }
      if (path !== ''){
      this.list.push(['pathWeight=' + path]);
  }

  }
  saveCSV(): void{

    this.fillList();

    this.changeName();
    console.log(this.list);

    // Creation du CSV grâce à l'attribut this.list
    const inCsv = cartesianProduct(this.list);

    const csvContent = 'data:text/csv;charset=utf-8,'
  + ('1GT\n')
      + inCsv.map((e: any[]) => e.join(';')).join('\n2\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    let name = this.fileName?.nativeElement.value!;
    if (name === '') { name = 'my_data'; }
    link.setAttribute('download', name + '.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
    this.dialogRef.close();
  }


  toList(val: string): Array<string>{
    const tmp = val.split(`,`).map(x => +x);
    const ret = [];
    for (let i = tmp[0]; i <= tmp[1]; i = i + tmp[2]){
      ret.push('' + i);
    }
    return ret;
  }

}

function cartesianProduct(arr: any[]) {
  return arr.reduce(function(a: any[], b: any[]){
      return a.map(function(x: any[]){
          return b.map(function(y: any){
              return x.concat([y]);
          });
      }).reduce(function(a: string | any[], b: any){ return a.concat(b); }, []);
  }, [[]]);
}
