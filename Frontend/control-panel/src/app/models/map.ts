/**
 * Defines the `Map` interface, which represents a game map in the context of the broadcasting tool. Each map has a unique identifier (`id`), and a human-readable name (`mapName`). This interface is used to structure the data related to game maps, allowing for consistent handling of map information throughout the application. The `id` property is typically used for internal logic and referencing, while the `mapName` property is translated and used for display purposes in the user interface, enabling users to easily identify and visualize the maps being used in the broadcast.
 */
export interface Map {
  id: string;
  mapName: string;
}
