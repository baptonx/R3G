import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeColonneComponent } from './node-colonne.component';

describe('NodeColonneComponent', () => {
  let component: NodeColonneComponent;
  let fixture: ComponentFixture<NodeColonneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeColonneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeColonneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
