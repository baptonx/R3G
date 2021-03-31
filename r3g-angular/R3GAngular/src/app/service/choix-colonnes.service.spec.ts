import { TestBed } from '@angular/core/testing';

import { ChoixColonnesService } from './choix-colonnes.service';

describe('ChoixColonnesService', () => {
  let service: ChoixColonnesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChoixColonnesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
