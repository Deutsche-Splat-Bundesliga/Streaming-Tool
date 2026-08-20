import { ApiKey } from './api-key';

/**
 * Response returned once when a new API key was created.
 * This is the only time the plaintext key is ever exposed.
 */
export interface ApiKeyCreated {
  key: string;
  apiKey: ApiKey;
}
