import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauExplorationComponent } from './tableau-exploration.component';

describe('TableauExplorationComponent', () => {
  let component: TableauExplorationComponent;
  let fixture: ComponentFixture<TableauExplorationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableauExplorationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableauExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
