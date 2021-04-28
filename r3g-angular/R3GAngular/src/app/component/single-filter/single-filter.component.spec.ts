import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleFilterComponent } from './single-filter.component';

describe('SingleFilterComponent', () => {
  let component: SingleFilterComponent;
  let fixture: ComponentFixture<SingleFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
