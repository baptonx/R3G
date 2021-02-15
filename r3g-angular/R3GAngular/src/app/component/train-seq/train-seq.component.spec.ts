import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainSeqComponent } from './train-seq.component';

describe('TrainSeqComponent', () => {
  let component: TrainSeqComponent;
  let fixture: ComponentFixture<TrainSeqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainSeqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainSeqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
