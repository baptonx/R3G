import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineExplorationComponent } from './engine-exploration.component';

describe('EngineExplorationComponent', () => {
  let component: EngineExplorationComponent;
  let fixture: ComponentFixture<EngineExplorationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineExplorationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngineExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
