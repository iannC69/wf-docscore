import crypto from "crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer into a Base32 string.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string into a buffer.
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a random 20-byte Base32 secret for 2FA TOTP.
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Computes a 6-digit TOTP code for a secret and timestamp counter.
 */
export function generateTotpCode(
  secret: string,
  timeStep = Math.floor(Date.now() / 1000 / 30)
): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const str = (code % 1000000).toString();
  return str.padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code against a secret with +/- 1 time step drift (tolerance).
 */
export function verifyTotpCode(secret: string, token: string): boolean {
  if (!token || token.length !== 6) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  // Check current, previous (-30s), and next (+30s) windows to account for clock skew
  for (let drift = -1; drift <= 1; drift++) {
    const expected = generateTotpCode(secret, currentStep + drift);
    if (expected === token.trim()) {
      return true;
    }
  }

  return false;
}

/**
 * Generates an otpauth URL for QR Code scanners (Google Authenticator / 1Password).
 */
export function getTotpUri(
  secret: string,
  account = "admin",
  issuer = "Wildfire Docs"
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(account);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
