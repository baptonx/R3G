import { HttpClient } from '@angular/common/http';
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AnnotationService } from 'src/app/module/annotation/annotation.service';
import { BddService } from 'src/app/service/bdd.service';

@Component({
  selector: 'app-editeur',
  templateUrl: './editeur.component.html',
  styleUrls: ['./editeur.component.css']
})
export class EditeurComponent implements OnInit, AfterViewInit {
  isLinear = false;
  displayedColumns = ['Geste', 'Couleur'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('inputGeste', {static: true})
  public inputGeste!: ElementRef<HTMLInputElement>;

  constructor(public http: HttpClient, public bdd: BddService, public annotation: AnnotationService) {
    this.annotation.observableData.subscribe(dataSource => {
      if (dataSource !== undefined) {
        dataSource.paginator = this.paginator;
      }
    });
  }

  changeVal(event: any, i: number): void {
    this.annotation.couleur[i] = event.target.value;
    this.annotation.geste = this.annotation.classeGeste[i];
    localStorage.setItem(this.annotation.geste, event.target.value);
    this.annotation.gesteCouleur.set(this.annotation.geste, event.target.value);
  }

  ngOnInit(): void {
    this.annotation.initializeClasseGesteEditeur();
  }

  ngAfterViewInit(): void {
      this.annotation.dataSource.paginator = this.paginator;
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
      const gestes = this.bdd.listGesteBDDAction.get(this.annotation.sequenceCurrent.bdd);
      if (gestes !== undefined) {
        const valInputGeste = this.inputGeste.nativeElement.value;
        if (valInputGeste !== '' && gestes.findIndex(element => element === valInputGeste) === -1) {
          gestes.push(valInputGeste);
          this.annotation.classeGeste.push(valInputGeste);
          this.inputGeste.nativeElement.value = '';
        }
      }
      console.log(this.bdd.listGesteBDDAction);
    }
  }

}
