import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAddTxtBddComponent } from './pop-up-add-txt-bdd.component';

describe('PopUpAddTxtBddComponent', () => {
  let component: PopUpAddTxtBddComponent;
  let fixture: ComponentFixture<PopUpAddTxtBddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpAddTxtBddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpAddTxtBddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
