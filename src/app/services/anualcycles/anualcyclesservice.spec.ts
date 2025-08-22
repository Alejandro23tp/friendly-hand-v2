import { TestBed } from '@angular/core/testing';

import { Anualcyclesservice } from './anualcyclesservice';

describe('Anualcyclesservice', () => {
  let service: Anualcyclesservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Anualcyclesservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
