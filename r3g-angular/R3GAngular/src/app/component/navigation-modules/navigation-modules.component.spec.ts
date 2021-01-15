import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationModulesComponent } from './navigation-modules.component';

describe('NavigationModulesComponent', () => {
  let component: NavigationModulesComponent;
  let fixture: ComponentFixture<NavigationModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationModulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
