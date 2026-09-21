/**
 * Schema that ajv uses to validate import of set data from json
 */
const SetDataExportSchema = {
  type: 'object',
  properties: {
    tournamentName: { type: 'string' },
    bracketName: { type: 'string' },
    teamAlphaName: { type: 'string' },
    teamBravoName: { type: 'string' },
    division: { type: 'number' },
    week: { type: 'number' },
    season: { type: 'number' },
    isLeague: { type: 'boolean' },
    maps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          mapId: { type: 'string' },
          modeId: { type: 'string' },
          order: { type: 'number' },
          winner: { type: ['string', 'null'] },
          isVisible: { type: 'boolean' },
        },
        additionalProperties: false,
        get required() {
          return Object.keys(this.properties);
        },
      },
    },
  },
  additionalProperties: false,
  get required() {
    return Object.keys(this.properties);
  },
};

// Prevent modification of object at runtime
Object.freeze(SetDataExportSchema);

export { SetDataExportSchema };
