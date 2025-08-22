import { TestBed } from '@angular/core/testing';

import { Loanpaypamentservice } from './loanpaypamentservice';

describe('Loanpaypamentservice', () => {
  let service: Loanpaypamentservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loanpaypamentservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
