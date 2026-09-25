import { TestBed } from '@angular/core/testing';
import { NotificationManager } from './notification-manager';
import { Notification } from '../models/notification';
import { NotificationType } from '../enums/notification-type';
import { untracked } from '@angular/core';

describe('NotificationManager', () => {
  let service: NotificationManager;

  const defaultNtfs: Notification[] = [
    {
      id: 'mock-1',
      type: NotificationType.Warning,
      text: 'Mocked Ntf 1',
      isDismissed: false,
      duration: 5000,
    },
    {
      id: 'mock-2',
      type: NotificationType.Info,
      text: 'Mocked Ntf 2',
      isDismissed: false,
      duration: 1500,
    },
    {
      id: 'mock-3',
      type: NotificationType.Error,
      text: 'Mocked Ntf 3',
      isDismissed: false,
      duration: 3000,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [NotificationManager],
    });
    service = TestBed.inject(NotificationManager);
    service.notifications.set(defaultNtfs);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create new temp notification', () => {
    const mockNtfType = NotificationType.Success;
    const mockNtfText = 'Temp Notification Mock Test';
    const mockNtfDuration = 10000;
    service.createTempNotification(mockNtfType, mockNtfText, mockNtfDuration);

    const notifications = untracked(service.notifications);
    const createdNtf = notifications.find(
      (ntf) =>
        ntf.type === mockNtfType && ntf.text === mockNtfText && ntf.duration === mockNtfDuration,
    );
    expect(notifications.length).toBe(4);
    expect(createdNtf).not.toBeUndefined();
  });

  it('should create new permanent notification', () => {
    const mockNtfId = 'mock-ntf-permanent';
    const mockNtfType = NotificationType.Warning;
    const mockNtfText = 'Temp Notification Mock Test';
    service.createPermanentNotification(mockNtfId, mockNtfType, mockNtfText);

    const notifications = untracked(service.notifications);
    const createdNtf = notifications.find((ntf) => ntf.id === mockNtfId);
    expect(notifications.length).toBe(4);
    expect(createdNtf).not.toBeUndefined();
    expect(createdNtf?.duration).toBe(0);
  });

  it('should dismiss notification', () => {
    const ntfId = defaultNtfs[2].id;
    service.dismissNotification(ntfId);

    const notifications = untracked(service.notifications);
    const dismissedNtf = notifications.find((ntf) => ntf.id === ntfId);
    expect(dismissedNtf?.isDismissed).toBe(true);
  });

  it('should delete notification', () => {
    const ntfId = defaultNtfs[0].id;
    service.deleteNotification(ntfId);

    const notifications = untracked(service.notifications);
    const deletedNtf = notifications.find((ntf) => ntf.id === ntfId);
    expect(notifications.length).toBe(2);
    expect(deletedNtf).toBeUndefined();
  });

  it('should dispose all notifications', () => {
    service.dispose();

    const notifications = untracked(service.notifications);
    expect(notifications).toStrictEqual([]);
  });
});
