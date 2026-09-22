import { TestBed } from '@angular/core/testing';
import { NotificationManager } from './notification-manager';

describe('NotificationManager', () => {
  let service: NotificationManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
