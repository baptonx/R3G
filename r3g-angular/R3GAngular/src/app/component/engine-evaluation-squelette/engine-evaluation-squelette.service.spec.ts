import { TestBed } from '@angular/core/testing';

import { EngineEvaluationSqueletteService } from './engine-evaluation-squelette.service';

describe('EngineExplorationService', () => {
  let service: EngineEvaluationSqueletteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineEvaluationSqueletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
