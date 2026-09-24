import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastNotification } from './notification';
import { getTranslocoModule } from '../../transloco-testing.module';
import { NotificationManager } from '../../services/notification-manager';
import { NotificationType } from '../../enums/notification-type';
import { Notification } from '../../models/notification';
import { signal, WritableSignal } from '@angular/core';

describe('ToastNotification', () => {
  let component: ToastNotification;
  let fixture: ComponentFixture<ToastNotification>;

  const mockNotifications: WritableSignal<Notification[]> = signal([
    {
      id: 'mock-ntf-1',
      type: NotificationType.Info,
      text: 'Mock Text',
      duration: 5000,
      isDismissed: true,
    },
  ]);

  const mockNotificationManager = {
    notifications: mockNotifications,
    dismissNotification: vi.fn(),
    deleteNotification: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastNotification, getTranslocoModule()],
      providers: [
        {
          provide: NotificationManager,
          useValue: mockNotificationManager,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastNotification);
    component = fixture.componentInstance;
    component.id = 'mock-ntf-1';
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get html class by type', () => {
    expect(component.notificationTypeClass).toBe('type--info');
  });
});
