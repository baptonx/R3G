import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';


@Component({
  selector: 'app-navigation-modules',
  templateUrl: './navigation-modules.component.html',
  styleUrls: ['./navigation-modules.component.css']
})
export class NavigationModulesComponent implements OnInit {
  static mod = 2;
  constructor(private router: Router) {
    const modc = this.router.getCurrentNavigation()?.extractedUrl.toString().split('/')[1];
    switch (modc) {
      case 'annotation':
        NavigationModulesComponent.mod = 1;
        break;
      case 'evaluation':
        NavigationModulesComponent.mod = 3;
        break;
      default:
        NavigationModulesComponent.mod = 2;
    }
  }

  ngOnInit(): void {
  }
  toAnnotation(): void{
    NavigationModulesComponent.mod = 1;
    this.router.navigate(['annotation']).then();
  }
  toExploration(): void{
    NavigationModulesComponent.mod = 2;
    this.router.navigate(['exploration']).then();
  }
  toEvaluation(): void{
    NavigationModulesComponent.mod = 3;
    this.router.navigate(['evaluation']).then();
  }
  getMod(): number{
    return NavigationModulesComponent.mod;
  }

}
