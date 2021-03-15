import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualitationExploComponent } from './visualitation-explo.component';

describe('VisualitationExploComponent', () => {
  let component: VisualitationExploComponent;
  let fixture: ComponentFixture<VisualitationExploComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualitationExploComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualitationExploComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
