import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Abogados } from './abogados';

describe('Abogados', () => {
  let component: Abogados;
  let fixture: ComponentFixture<Abogados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Abogados],
    }).compileComponents();

    fixture = TestBed.createComponent(Abogados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
