import { TestBed } from '@angular/core/testing';

import { VisualisationExploService } from './visualisation-explo.service';

describe('VisualisationExploService', () => {
  let service: VisualisationExploService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualisationExploService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
