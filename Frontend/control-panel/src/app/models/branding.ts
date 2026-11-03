export interface Branding {
  organizationName: string;
  organizationShortName: string;
  tournamentName: string;
  logoUrl: string;
  largeLogoUrl: string;
  outlineLogoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export const DEFAULT_BRANDING: Branding = {
  organizationName: 'Deutsche Splat Bundesliga',
  organizationShortName: 'DSB',
  tournamentName: 'Deutsche Splat Bundesliga',
  logoUrl: 'assets/dsb/DSB_Logo.png',
  largeLogoUrl: 'assets/dsb/DSB_Logo-Large.png',
  outlineLogoUrl: 'assets/dsb/DSB_Outline_White.png',
  primaryColor: '#501776',
  secondaryColor: '#c4c4c4',
};
