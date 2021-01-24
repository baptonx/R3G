import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnnotationComponent } from './module/annotation/annotation.component';
import { ExplorationComponent } from './module/exploration/exploration.component';
import { EvaluationComponent } from './module/evaluation/evaluation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ApprentissageComponent } from './component/apprentissage/apprentissage.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule, Routes} from '@angular/router';
import { DialogCSVComponent } from './component/dialog-csv/dialog-csv.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import { TableauExplComponent } from './component/tableau-expl/tableau-expl.component';
import { NavigationModulesComponent } from './component/navigation-modules/navigation-modules.component';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import {EngineComponent} from './component/engine/engine.component';
import { HttpClientModule } from '@angular/common/http';

const appRoutes: Routes = [
  { path: 'annotation', component: AnnotationComponent },
  { path: 'evaluation', component: EvaluationComponent },
  { path: 'exploration', component: ExplorationComponent },
  { path: '', component: ExplorationComponent}
];
@NgModule({
  declarations: [
    AppComponent,
    AnnotationComponent,
    ExplorationComponent,
    EvaluationComponent,
    ApprentissageComponent,
    DialogCSVComponent,
    TableauExplComponent,
    NavigationModulesComponent,
    EngineComponent
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
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,


    RouterModule.forRoot(appRoutes),
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    HttpClientModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
