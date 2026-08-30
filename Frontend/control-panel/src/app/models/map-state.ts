/**
 * Defines the `MapState` interface, which represents the state of a map in the context of the broadcasting tool. Each `MapState` object contains information about a specific map being played, including its unique identifier (`id`), order in the match (`order`), associated map and mode details (`mapId`, `mapName`, `modeId`, `modeName`), an image URL for visual representation (`imageUrl`), the winner of the map if applicable (`winner`), and whether the map is currently visible in the broadcast (`isVisible`). This interface is used to structure and manage the state of maps throughout the application, allowing for consistent handling and display of map-related information in the user interface.
 */
export interface MapState {
  id: string;
  order: number;
  mapId: string;
  modeId: string;
  winner?: 'alpha' | 'bravo' | null;
  isVisible: boolean;
}
