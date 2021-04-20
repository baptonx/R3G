import { TestBed } from '@angular/core/testing';

import { EngineExplorationService } from './engine-exploration.service';

describe('EngineExplorationService', () => {
  let service: EngineExplorationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineExplorationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
