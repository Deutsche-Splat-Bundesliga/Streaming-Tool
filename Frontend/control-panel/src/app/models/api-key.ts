/**
 * Represents an issued API key as shown in the Control Panel.
 * Never contains the plaintext key or its hash.
 */
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  accessLevel: number;
  createdAt: string;
  lastUsedAt: string | null;
}
