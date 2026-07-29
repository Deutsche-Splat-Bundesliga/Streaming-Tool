import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommBoxSettingsDialog } from './comm-box-settings-dialog';
import { CommentatorBoxTimeData } from '../../models/commentator-box-time-data';
import { CommBoxDisplayMode } from '../../enums/comm-box-display-modes';
import { signal } from '@angular/core';
import { CommentatorBoxTimeDataService } from '../../services/commentator-box-time-data';

describe('CommBoxSettingsDialog', () => {
  let component: CommBoxSettingsDialog;
  let fixture: ComponentFixture<CommBoxSettingsDialog>;

  const defaultTimeData: CommentatorBoxTimeData = {
    hideDisplayIntervalInSeconds: 50,
    showDisplayIntervalInSeconds: 5,
    displayMode: CommBoxDisplayMode.Manual,
  };

  const mockTimeData = signal<CommentatorBoxTimeData>(defaultTimeData);

  const mockTimeDataService = {
    commentatorBoxTimeData: mockTimeData,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommBoxSettingsDialog],
      providers: [
        {
          provide: CommentatorBoxTimeDataService,
          useValue: mockTimeDataService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommBoxSettingsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject CommentatorBoxTimeDataService', () => {
    expect(component.commentatorBoxTimeDataService).toBe(mockTimeDataService);
  });

  it('should expose time data signal from CommentatorBoxTimeDataService', () => {
    expect(component.commentatorBoxTimeData).toBe(mockTimeDataService.commentatorBoxTimeData);
    expect(component.commentatorBoxTimeData()).toEqual(defaultTimeData);
  });

  it('should reflect state changes from CommentatorBoxTimeDataService', () => {
    const updatedTimeData: CommentatorBoxTimeData = {
      ...defaultTimeData,
      hideDisplayIntervalInSeconds: 35,
      showDisplayIntervalInSeconds: 10,
      displayMode: CommBoxDisplayMode.Auto,
    };

    mockTimeData.set(updatedTimeData);

    expect(component.commentatorBoxTimeData()).toEqual(updatedTimeData);
  });

  it('should reflect commBoxDisplayMode enum property', () => {
    expect(component.commBoxDisplayMode).toEqual(CommBoxDisplayMode);
  });
});
