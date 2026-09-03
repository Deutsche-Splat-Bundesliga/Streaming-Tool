import { MapState } from './map-state';

/**
 * Defines the `BroadcastState` interface, which represents the overall state of the broadcast in the context of the broadcasting tool. This interface includes properties for team information (such as team names and which team is on the left), score details for both teams, commentator information, visibility settings for various overlays (like map screen, score box, commentator box, and infobox), an array of `MapState` objects representing the state of each map being played, and league information such as season and division. The `BroadcastState` interface serves as a central structure for managing and accessing all relevant information about the current state of the broadcast, allowing for consistent handling and display of this information across different components of the application.
 */
export interface BroadcastState {
  // Teams
  teamAlphaName: string;
  teamBravoName: string;
  alphaIsLeft: boolean;

  // Match start time
  startTime: Date;

  // Score
  scoreAlpha: number;
  scoreBravo: number;

  // Streamer
  streamer: string;

  // Casters
  commentator1: string;
  commentator2: string;

  // Overlay Visibility
  showMapScreen: boolean;
  showScoreBox: boolean;
  showCommentatorBox: boolean;
  showInfobox: boolean;

  // Maps
  maps: MapState[];

  // Tournament Information
  season: number;
  division: number;
  week: number;
  isLeague: boolean;
  tournamentName: string;
  bracketName: string;

  // Color Information
  currentColorsId: number;
  colorLockActive: boolean;
}
