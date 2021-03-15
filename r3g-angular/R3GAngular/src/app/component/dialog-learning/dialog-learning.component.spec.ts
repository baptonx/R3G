import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLearningComponent } from './dialog-learning.component';

describe('DialogLearningComponent', () => {
  let component: DialogLearningComponent;
  let fixture: ComponentFixture<DialogLearningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogLearningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
