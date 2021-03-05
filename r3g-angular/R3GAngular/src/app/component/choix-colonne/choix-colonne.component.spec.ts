import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoixColonneComponent } from './choix-colonne.component';

describe('ChoixColonneComponent', () => {
  let component: ChoixColonneComponent;
  let fixture: ComponentFixture<ChoixColonneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoixColonneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoixColonneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
