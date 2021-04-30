import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpBddTxtToInkmlComponent } from './pop-up-bdd-txt-to-inkml.component';

describe('PopUpAddTxtBddComponent', () => {
  let component: PopUpBddTxtToInkmlComponent;
  let fixture: ComponentFixture<PopUpBddTxtToInkmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpBddTxtToInkmlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpBddTxtToInkmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
