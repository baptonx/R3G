import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocoleSeqComponent } from './protocole-seq.component';

describe('ProtocoleSeqComponent', () => {
  let component: ProtocoleSeqComponent;
  let fixture: ComponentFixture<ProtocoleSeqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProtocoleSeqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocoleSeqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
