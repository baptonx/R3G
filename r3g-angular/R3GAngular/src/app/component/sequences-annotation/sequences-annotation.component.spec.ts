import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequencesAnnotationComponent } from './sequences-annotation.component';

describe('SequencesAnnotationComponent', () => {
  let component: SequencesAnnotationComponent;
  let fixture: ComponentFixture<SequencesAnnotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequencesAnnotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencesAnnotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
