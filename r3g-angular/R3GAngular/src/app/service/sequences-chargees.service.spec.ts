import { TestBed } from '@angular/core/testing';

import { SequencesChargeesService } from './sequences-chargees.service';

describe('SequencesChargeesService', () => {
  let service: SequencesChargeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SequencesChargeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
