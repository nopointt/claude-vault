import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { join } from "path";
import { homedir } from "os";

const VAULT_DIR = join(homedir(), ".claude-vault");
const KEY_FILE = join(VAULT_DIR, "vault.key");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export async function generateKey(): Promise<Buffer> {
  const key = randomBytes(32);
  await Bun.write(KEY_FILE, key);
  return key;
}

export async function loadKey(): Promise<Buffer> {
  const file = Bun.file(KEY_FILE);
  if (!(await file.exists())) {
    throw new Error(`Vault key not found at ${KEY_FILE}. Run: claude-vault init`);
  }
  const buf = await file.arrayBuffer();
  return Buffer.from(buf);
}

export function encrypt(plaintext: string, key: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

export function decrypt(packed: Buffer, key: Buffer): string {
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
