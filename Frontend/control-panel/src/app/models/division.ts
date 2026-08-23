/**
 * Defines the `Division` interface, which represents a competitive division in the context of the broadcasting tool. Each division has a unique identifier (`id`) and a human-readable name (`name`). This interface is used to structure the data related to divisions, allowing for consistent handling of division information throughout the application. The `id` property is typically used for internal logic and referencing, while the `name` property is used for display purposes in the user interface, enabling users to easily identify and differentiate between various divisions in the broadcast.
 */
export interface Division {
  id: number;
  name: string;
  color: string;
}
