import { TestBed } from '@angular/core/testing';

import { Loansservice } from './loansservice';

describe('Loansservice', () => {
  let service: Loansservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loansservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
