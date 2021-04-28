import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AnnotationService } from 'src/app/module/annotation/annotation.service';
import { BddService } from 'src/app/service/bdd.service';

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

  constructor(public http: HttpClient, public bdd: BddService, public annotation: AnnotationService) {
    this.bdd.listGesteBDD.forEach((value: string[], key: string) => {
      value.forEach(elt => {
        this.classeGeste.push(elt);
      });
    });

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

  changeVal(event: any, i: number): void {
    this.couleur[i] = event.target.value;
    this.geste = this.classeGeste[i];
    localStorage.setItem(this.geste, event.target.value);
    this.annotation.gesteCouleur.set(this.geste, event.target.value);
  }

  ngOnInit(): void {
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

  supprimerAnnotationCurrent(): void {
    this.annotation.supprimerAnnotationCurrent();
  }

  supprimerToutesAnnotations(): void {
    this.annotation.supprimerToutesAnnotations();
  }

}
