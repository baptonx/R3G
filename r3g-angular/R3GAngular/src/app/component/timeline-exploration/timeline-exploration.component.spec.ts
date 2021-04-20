import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineExplorationComponent } from './timeline-exploration.component';

describe('TimelineExplorationComponent', () => {
  let component: TimelineExplorationComponent;
  let fixture: ComponentFixture<TimelineExplorationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineExplorationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineExplorationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
