import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialsDialog } from './socials-dialog';
import { Socials } from '../../models/socials';
import { signal } from '@angular/core';
import { SocialsService } from '../../services/socials';

describe('SocialsDialog', () => {
  let component: SocialsDialog;
  let fixture: ComponentFixture<SocialsDialog>;

  const defaultSocials: Socials = {
    xHandle: '',
    discordInvite: '',
  };

  const mockSocials = signal<Socials>(defaultSocials);

  const mockSocialsService = {
    socials: mockSocials,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialsDialog],
      providers: [
        {
          provide: SocialsService,
          useValue: mockSocialsService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject SocialsService', () => {
    expect(component.socialsService).toBe(mockSocialsService);
  });

  it('should expose socials signal from SocialsService', () => {
    expect(component.socials).toBe(mockSocialsService.socials);
    expect(component.socials()).toEqual(defaultSocials);
  });

  it('should reflect state changes from SocialsService', () => {
    const updatedSocials: Socials = {
      ...defaultSocials,
      xHandle: 'testxhandle',
      discordInvite: 'testinvite',
    };

    mockSocials.set(updatedSocials);

    expect(component.socials()).toEqual(updatedSocials);
  });
});
