import { TestBed } from '@angular/core/testing';

import { TimelineExplorationService } from './timeline-exploration.service';

describe('TimelineExplorationService', () => {
  let service: TimelineExplorationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineExplorationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
