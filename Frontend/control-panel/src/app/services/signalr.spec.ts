import { TestBed } from '@angular/core/testing';
import * as signalR from '@microsoft/signalr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Signalr } from './signalr';
import { Branding } from '../models/branding';

describe('Signalr', () => {
  let service: Signalr;
  const handlers = new Map<string, (...args: unknown[]) => void>();

  const mockConnection = {
    on: vi.fn((eventName: string, handler: (...args: unknown[]) => void) => {
      handlers.set(eventName, handler);
    }),
    onreconnecting: vi.fn(),
    onreconnected: vi.fn(),
    onclose: vi.fn(),
    start: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();

    TestBed.resetTestingModule();

    vi.spyOn(signalR.HubConnectionBuilder.prototype, 'withUrl').mockReturnThis();

    vi.spyOn(signalR.HubConnectionBuilder.prototype, 'withAutomaticReconnect').mockReturnThis();

    vi.spyOn(signalR.HubConnectionBuilder.prototype, 'build').mockReturnValue(
      mockConnection as never,
    );

    TestBed.configureTestingModule({
      providers: [Signalr],
    });

    service = TestBed.inject(Signalr);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a start method', () => {
    expect(typeof service.start).toBe('function');
  });

  it('should have live state signal initialized to null', () => {
    expect(service.liveState).toBeDefined();
    expect(service.liveState()).toBeNull();
  });

  it('should have live socials signal initialized to null', () => {
    expect(service.liveSocials).toBeDefined();
    expect(service.liveState()).toBeNull();
  });

  it('should have live time data signal initialized to null', () => {
    expect(service.liveCommentatorBoxTimeData).toBeDefined();
    expect(service.liveState()).toBeNull();
  });

  it('should have isConnected signal initialized to false', () => {
    expect(service.isConnected).toBeDefined();
    expect(service.isConnected()).toBe(false);
  });

  it('should have a tryConnect method', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(typeof (service as any).tryConnect).toBe('function');
  });

  it('should build a SignalR connection', async () => {
    await service.start();

    expect(signalR.HubConnectionBuilder.prototype.withUrl).toHaveBeenCalledWith(
      'http://localhost:7000/overlayHub',
    );

    expect(signalR.HubConnectionBuilder.prototype.withAutomaticReconnect).toHaveBeenCalled();

    expect(signalR.HubConnectionBuilder.prototype.build).toHaveBeenCalled();

    expect(mockConnection.on).toHaveBeenCalledWith('broadcastStateUpdated', expect.any(Function));
    expect(mockConnection.on).toHaveBeenCalledWith('brandingUpdated', expect.any(Function));

    expect(mockConnection.onreconnecting).toHaveBeenCalled();
    expect(mockConnection.onreconnected).toHaveBeenCalled();
    expect(mockConnection.onclose).toHaveBeenCalled();

    expect(mockConnection.start).toHaveBeenCalled();
    expect(service.isConnected()).toBe(true);
  });

  it('should retry connection after 5 seconds when start fails', async () => {
    vi.useFakeTimers();

    mockConnection.start
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce(undefined);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await service.start();

    expect(mockConnection.start).toHaveBeenCalledTimes(1);
    expect(service.isConnected()).toBe(false);

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockConnection.start).toHaveBeenCalledTimes(2);
    expect(service.isConnected()).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  it('should receive branding updates on the shared connection', async () => {
    await service.start();
    const branding: Branding = {
      organizationName: 'Example Org',
      organizationShortName: 'EX',
      tournamentName: 'Example Cup',
      logoUrl: 'assets/example/logo.png',
      largeLogoUrl: 'assets/example/logo-large.png',
      outlineLogoUrl: 'assets/example/logo-outline.png',
      primaryColor: '#123456',
      secondaryColor: '#abcdef',
    };

    handlers.get('brandingUpdated')?.(branding);

    expect(service.liveBranding()).toEqual(branding);
  });

  it('should start only one connection when multiple services request it', async () => {
    await service.start();
    await service.start();

    expect(signalR.HubConnectionBuilder.prototype.build).toHaveBeenCalledOnce();
    expect(mockConnection.start).toHaveBeenCalledOnce();
  });
});
