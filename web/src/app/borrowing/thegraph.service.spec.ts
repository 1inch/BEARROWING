import { TestBed } from '@angular/core/testing';

import { ThegraphService } from './thegraph.service';

describe('ThegraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThegraphService = TestBed.get(ThegraphService);
    expect(service).toBeTruthy();
  });
});
