import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnnotationComponent } from './module/annotation/annotation.component';
import { ExplorationComponent } from './module/exploration/exploration.component';
import { EvaluationComponent } from './module/evaluation/evaluation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableauExplorationComponent } from './tableau-exploration/tableau-exploration.component';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from "@angular/material/paginator";
import { ApprentissageComponent } from './component/apprentissage/apprentissage.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    AnnotationComponent,
    ExplorationComponent,
    EvaluationComponent,
    TableauExplorationComponent,
    ApprentissageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
    

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
