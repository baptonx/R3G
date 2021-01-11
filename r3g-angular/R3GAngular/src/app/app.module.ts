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
import {MatPaginatorModule} from "@angular/material/paginator";

@NgModule({
  declarations: [
    AppComponent,
    AnnotationComponent,
    ExplorationComponent,
    EvaluationComponent,
    TableauExplorationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
