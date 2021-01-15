import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauExplComponent } from './tableau-expl.component';

describe('TableauExplComponent', () => {
  let component: TableauExplComponent;
  let fixture: ComponentFixture<TableauExplComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableauExplComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauExplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
