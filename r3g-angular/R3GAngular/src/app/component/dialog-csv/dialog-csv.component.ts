import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { DialogData } from '../apprentissage/apprentissage.component';

@Component({
  selector: 'app-dialog-csv',
  templateUrl: './dialog-csv.component.html',
  styleUrls: ['./dialog-csv.component.css']
})
export class DialogCSVComponent implements OnInit {
  @ViewChild('doBatchNM') 
  doBatchNM: ElementRef<MatSelect> | undefined
  list:Array<Array<number>>


 
  constructor(
    public dialogRef: MatDialogRef<DialogCSVComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.list=[]
    this.list.push([])
   }

  ngOnInit(): void {
    console.log(this.data)
  }
  saveCSV():void{

    const rows = [
      ["name1", "city1", "some other info"],
      ["name2", "city2", "more info"]
  ];
  
  let csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");
      var encodedUri = encodeURI(csvContent);
var link = document.createElement("a");
link.setAttribute("href", encodedUri);
link.setAttribute("download", "my_data.csv");
document.body.appendChild(link); // Required for FF

link.click(); // This will download the data file named "my_data.csv".
    this.dialogRef.close()
  }

  createNumList():void{

  }

}
