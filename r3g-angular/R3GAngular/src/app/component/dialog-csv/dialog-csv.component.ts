import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { DialogData } from '../apprentissage/apprentissage.component';

@Component({
  selector: 'app-dialog-csv',
  templateUrl: './dialog-csv.component.html',
  styleUrls: ['./dialog-csv.component.css']
})
export class DialogCSVComponent implements OnInit {
  @ViewChild('fileName') 
  fileName:ElementRef<MatInput> | undefined
  list:Array<Array<string>>


 
  constructor(
    public dialogRef: MatDialogRef<DialogCSVComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.list=[]
   }

  ngOnInit(): void {
   
  }
  saveCSV():void{

this.data.hyperparametersNumberVal.forEach(elt=>{
  if( elt.includes(",") && !elt.includes("[")){
    this.list.push(this.toList(elt))
  }
  else{
    var tmp=[]
    tmp.push(elt)
    this.list.push(tmp)
  }
})
for(var i=0;i<this.list.length;i++){
  for(var j=0;j<this.list[i].length;j++){
    this.list[i][j]=this.data.hyperparametersNumber[i]+"="+this.list[i][j]
  }
}
var inCsv = cartesianProduct(this.list);
console.log(this.list)

  let csvContent = "data:text/csv;charset=utf-8," 
      + inCsv.map((e: any[]) => e.join(";")).join("\n2\n");
      var encodedUri = encodeURI(csvContent);
      console.log(encodedUri)
var link = document.createElement("a");
link.setAttribute("href", encodedUri);
var name=this.fileName?.nativeElement.value!
if(name==='') name="my_data"
link.setAttribute("download", name+"csv");
document.body.appendChild(link); // Required for FF

//link.click(); // This will download the data file named "my_data.csv".
    this.dialogRef.close()
  }


  toList(val:string):Array<string>{
    var tmp=val.split(`,`).map(x=>+x)
    var ret=[]
    for(var i=tmp[0];i<=tmp[1];i=i+tmp[2]){
      ret.push(""+i)
    }
    console.log(ret)
return ret
  }
}

function cartesianProduct(arr: any[]) {
  return arr.reduce(function(a: any[],b: any[]){
      return a.map(function(x: any[]){
          return b.map(function(y: any){
              return x.concat([y]);
          })
      }).reduce(function(a: string | any[],b: any){ return a.concat(b) },[])
  }, [[]])
}
