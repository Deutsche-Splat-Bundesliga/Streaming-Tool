import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsContainer } from './notifications-container';

describe('NotificationsContainer', () => {
  let component: NotificationsContainer;
  let fixture: ComponentFixture<NotificationsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
