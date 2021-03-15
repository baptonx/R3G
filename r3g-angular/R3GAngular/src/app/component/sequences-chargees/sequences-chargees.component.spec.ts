import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequencesChargeesComponent } from './sequences-chargees.component';

describe('SequencesChargeesComponent', () => {
  let component: SequencesChargeesComponent;
  let fixture: ComponentFixture<SequencesChargeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequencesChargeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencesChargeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
