import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Notification } from './notification';

describe('Notification', () => {
  let component: Notification;
  let fixture: ComponentFixture<Notification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notification],
    }).compileComponents();

    fixture = TestBed.createComponent(Notification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
