import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEvalComponent } from './dialog-eval.component';

describe('DialogEvalComponent', () => {
  let component: DialogEvalComponent;
  let fixture: ComponentFixture<DialogEvalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogEvalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
