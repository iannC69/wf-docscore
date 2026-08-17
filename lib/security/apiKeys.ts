import { generateRandomToken, sha256 } from "./crypto";
import { recordAuditEvent } from "./audit";

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  tokenHash: string;
  scope: "full_access" | "read_only" | "ci_cd";
  createdAt: string;
  lastUsedAt?: string;
  expiresAt: string;
  revoked: boolean;
}

// Global in-memory API key directory
const globalApiKeys: ApiKeyRecord[] = (globalThis as any).__wf_api_keys || [
  {
    id: "key_initial_ci",
    name: "GitHub Actions CI/CD Deployment Key",
    prefix: "wf_ci_8f92",
    tokenHash: sha256("wf_ci_8f921471029384719283471092834710"),
    scope: "ci_cd",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastUsedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
    revoked: false,
  },
];
(globalThis as any).__wf_api_keys = globalApiKeys;

export function generateApiKey(params: {
  name: string;
  scope: "full_access" | "read_only" | "ci_cd";
  expiresInDays?: number;
  actor?: string;
}): { rawToken: string; record: ApiKeyRecord } {
  const secretRandom = generateRandomToken(24);
  const rawToken = `wf_${params.scope === "ci_cd" ? "ci" : "live"}_${secretRandom}`;
  const prefix = rawToken.slice(0, 10);
  const tokenHash = sha256(rawToken);
  const days = params.expiresInDays || 90;

  const record: ApiKeyRecord = {
    id: `key_${Date.now()}_${generateRandomToken(4)}`,
    name: params.name,
    prefix,
    tokenHash,
    scope: params.scope,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
    revoked: false,
  };

  globalApiKeys.unshift(record);

  recordAuditEvent({
    action: "SETTINGS_UPDATE",
    actor: params.actor || "admin",
    details: { createdApiKey: record.name, keyId: record.id, scope: record.scope },
  });

  return { rawToken, record };
}

export function listApiKeys(): ApiKeyRecord[] {
  return (globalThis as any).__wf_api_keys || [];
}

export function revokeApiKey(keyId: string, actor = "admin"): boolean {
  const keys = (globalThis as any).__wf_api_keys as ApiKeyRecord[];
  const key = keys.find((k) => k.id === keyId);
  if (!key) return false;

  key.revoked = true;

  recordAuditEvent({
    action: "SETTINGS_UPDATE",
    actor,
    details: { revokedApiKey: key.name, keyId: key.id },
  });

  return true;
}
