import { TestBed } from '@angular/core/testing';

import { Participanteservice } from './participanteservice';

describe('Participanteservice', () => {
  let service: Participanteservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Participanteservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
