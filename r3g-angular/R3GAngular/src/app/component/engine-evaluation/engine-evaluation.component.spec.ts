import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineEvaluationComponent } from './engine-evaluation.component';

describe('EngineEvaluationComponent', () => {
  let component: EngineEvaluationComponent;
  let fixture: ComponentFixture<EngineEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
