import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AnnotationService } from 'src/app/module/annotation/annotation.service';
import { BddService } from 'src/app/service/bdd.service';
import {AbstractControl, FormControl, NgControl, Validator, ValidatorFn} from '@angular/forms';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.css']
})
export class EditeurComponent implements OnInit, AfterViewInit {
  isLinear = false;
  classeGeste: Array<string> = [];
  couleur: Array<string> = [];
  geste = '';
  dataSource!: MatTableDataSource<string>;
  displayedColumns = ['Geste', 'Couleur'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('inputGeste', {static: true})
  public inputGeste!: ElementRef<HTMLInputElement>;

  constructor(public http: HttpClient, public bdd: BddService, public annotation: AnnotationService) {
  }

  changeVal(event: any, i: number): void {
    this.couleur[i] = event.target.value;
    this.geste = this.classeGeste[i];
    localStorage.setItem(this.geste, event.target.value);
    this.annotation.gesteCouleur.set(this.geste, event.target.value);
  }

  ngOnInit(): void {
    if (this.annotation.sequenceCurrent !== undefined) {
      this.bdd.listGesteBDD.forEach((value: string[], key: string) => {
        console.log('key : ' + key);
        console.log('bdd : ' + this.annotation.sequenceCurrent?.bdd);
        if (this.annotation.sequenceCurrent?.bdd === key) {
          value.forEach(elt => {
            this.classeGeste.push(elt);
          });
        }
      });
    }

    this.classeGeste.forEach(geste => {
      const Col = localStorage.getItem(geste);
      if (Col !== null){  //  it checks values here or not to the variable
        this.couleur.push(Col);
        this.annotation.gesteCouleur.set(geste, Col);
      }
      else {
        this.couleur.push('');
      }
    });
    this.dataSource = new MatTableDataSource<string>(this.classeGeste);
  }

  ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
  }

  updateF1(event: any): void {
    this.annotation.updateF1(event);
  }

  updateF2(event: any): void {
    this.annotation.updateF2(event);
  }

  updatePointAction(event: any): void {
    this.annotation.updatePointAction(event);
  }

  supprimerAnnotationCurrent(): void {
    this.annotation.supprimerAnnotationCurrent();
  }

  supprimerToutesAnnotations(): void {
    this.annotation.supprimerToutesAnnotations();
  }

  validerCreationGeste(): void {
    if (this.annotation.sequenceCurrent !== undefined) {
      const gestes = this.bdd.listGesteBDD.get(this.annotation.sequenceCurrent.bdd);
      if (gestes !== undefined) {
        const valInputGeste = this.inputGeste.nativeElement.value;
        if (valInputGeste !== '' && gestes.findIndex(element => element === valInputGeste) === -1) {
          gestes.push(valInputGeste);
          this.classeGeste.push(valInputGeste);
          this.inputGeste.nativeElement.value = '';
        }
      }
      console.log(this.bdd.listGesteBDD);
    }
  }

}
