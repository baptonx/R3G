import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCSVComponent } from './dialog-csv.component';

describe('DialogCSVComponent', () => {
  let component: DialogCSVComponent;
  let fixture: ComponentFixture<DialogCSVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCSVComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCSVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
