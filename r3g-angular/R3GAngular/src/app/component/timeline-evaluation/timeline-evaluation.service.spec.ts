import { TestBed } from '@angular/core/testing';

import { TimelineEvaluationService } from './timeline-evaluation.service';

describe('TimelineEvaluationService', () => {
  let service: TimelineEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
