import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AnnotationComponent} from "./module/annotation/annotation.component";
import {EvaluationComponent} from "./module/evaluation/evaluation.component";
import {ExplorationComponent} from "./module/exploration/exploration.component";

const routes: Routes = [
  {path: 'annotation', component: AnnotationComponent},
  {path: 'evaluation', component: EvaluationComponent},
  {path: 'exploration', component: ExplorationComponent},
  {
    path: '',
    redirectTo: '/exploration',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
