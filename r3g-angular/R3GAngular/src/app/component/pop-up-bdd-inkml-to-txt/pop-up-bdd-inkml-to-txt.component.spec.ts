import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpBddInkmlToTxtComponent } from './pop-up-bdd-inkml-to-txt.component';

describe('PopUpBddInkmlToTxtComponent', () => {
  let component: PopUpBddInkmlToTxtComponent;
  let fixture: ComponentFixture<PopUpBddInkmlToTxtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpBddInkmlToTxtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpBddInkmlToTxtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
