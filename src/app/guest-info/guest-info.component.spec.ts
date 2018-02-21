import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestInfoComponent } from './guest-info.component';

describe('GuestInfoComponent', () => {
  let component: GuestInfoComponent;
  let fixture: ComponentFixture<GuestInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuestInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
