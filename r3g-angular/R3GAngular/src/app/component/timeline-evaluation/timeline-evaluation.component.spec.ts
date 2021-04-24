import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineEvaluationComponent } from './timeline-evaluation.component';

describe('TimelineEvaluationComponent', () => {
  let component: TimelineEvaluationComponent;
  let fixture: ComponentFixture<TimelineEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
