import { TestBed } from '@angular/core/testing';

import { Rut } from './rut';

describe('Rut', () => {
  let service: Rut;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rut);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
