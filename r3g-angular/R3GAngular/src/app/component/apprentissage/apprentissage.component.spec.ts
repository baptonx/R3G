import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprentissageComponent } from './apprentissage.component';

describe('ApprentissageComponent', () => {
  let component: ApprentissageComponent;
  let fixture: ComponentFixture<ApprentissageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprentissageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprentissageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
