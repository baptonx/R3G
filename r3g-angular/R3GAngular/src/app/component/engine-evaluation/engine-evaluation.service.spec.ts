import { TestBed } from '@angular/core/testing';

import { EngineEvaluationService } from './engine-evaluation.service';

describe('EngineEvaluationService', () => {
  let service: EngineEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
