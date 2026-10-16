import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicoPanel } from './medico-panel';

describe('MedicoPanel', () => {
  let component: MedicoPanel;
  let fixture: ComponentFixture<MedicoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicoPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicoPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
