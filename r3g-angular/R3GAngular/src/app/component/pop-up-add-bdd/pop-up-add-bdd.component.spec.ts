import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAddBddComponent } from './pop-up-add-bdd.component';

describe('PopUpComponent', () => {
  let component: PopUpAddBddComponent;
  let fixture: ComponentFixture<PopUpAddBddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpAddBddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpAddBddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
