import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnnotationComponent } from './module/annotation/annotation.component';
import { ExplorationComponent} from './module/exploration/exploration.component';
import { EvaluationComponent } from './module/evaluation/evaluation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
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
import { DialogLearningComponent } from './component/dialog-learning/dialog-learning.component';
import {MatStepperModule} from '@angular/material/stepper';
import { TrainSeqComponent } from './component/train-seq/train-seq.component';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SequencesChargeesComponent } from './component/sequences-chargees/sequences-chargees.component';
import { VisualitationExploComponent } from './component/visualitation-explo/visualitation-explo.component';
import { ProtocoleSeqComponent } from './component/protocole-seq/protocole-seq.component';
import { ChoixColonneComponent } from './component/choix-colonne/choix-colonne.component';
import { NodeColonneComponent } from './component/node-colonne/node-colonne.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { TimelineComponent } from './component/timeline/timeline.component';
import { MatSortModule } from "@angular/material/sort";
import { DialogEvalComponent } from './component/dialog-eval/dialog-eval.component';
import { PopUpComponent } from './component/pop-up/pop-up.component';

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
    EngineComponent,
    DialogLearningComponent,
    TrainSeqComponent,
    SequencesChargeesComponent,
    VisualitationExploComponent,
    ProtocoleSeqComponent,
    ChoixColonneComponent,
    NodeColonneComponent,
    TimelineComponent,
    DialogEvalComponent,
    PopUpComponent,
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
        MatStepperModule,
        MatRadioModule,
        MatCheckboxModule,
        MatButtonToggleModule,
        MatSortModule,
        MatProgressBarModule,
        RouterModule.forRoot(appRoutes),
        MatListModule,
        MatMenuModule,
        MatToolbarModule,
        MatTabsModule,
        HttpClientModule,
        MatTooltipModule,

    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
