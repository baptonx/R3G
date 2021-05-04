import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineEvaluationSqueletteComponent } from './engine-evaluation-squelette.component';

describe('EngineExplorationComponent', () => {
  let component: EngineEvaluationSqueletteComponent;
  let fixture: ComponentFixture<EngineEvaluationSqueletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineEvaluationSqueletteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineEvaluationSqueletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
