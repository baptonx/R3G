import { TestBed } from '@angular/core/testing';

import { TableauExplService } from './tableau-expl.service';

describe('TableauExplService', () => {
  let service: TableauExplService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableauExplService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
