import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacientePortal } from './paciente-portal';

describe('PacientePortal', () => {
  let component: PacientePortal;
  let fixture: ComponentFixture<PacientePortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientePortal],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientePortal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
