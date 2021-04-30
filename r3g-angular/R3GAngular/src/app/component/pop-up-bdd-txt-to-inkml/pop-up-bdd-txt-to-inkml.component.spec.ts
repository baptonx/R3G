import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpBddTxtToInkmlcomponent } from './pop-up-bdd-txt-to-inkmlcomponent';

describe('PopUpAddTxtBddComponent', () => {
  let component: PopUpBddTxtToInkmlcomponent;
  let fixture: ComponentFixture<PopUpBddTxtToInkmlcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpBddTxtToInkmlcomponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpBddTxtToInkmlcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
