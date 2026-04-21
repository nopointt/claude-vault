import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { join } from "path";
import { chmodSync, statSync } from "fs";
import { VAULT_DIR } from "./constants";

const KEY_FILE = join(VAULT_DIR, "vault.key");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const IS_WINDOWS = process.platform === "win32";

/** Generate a 32-byte AES-256 key, write to vault.key, chmod 600 on Unix. */
export async function generateKey(): Promise<Buffer> {
  const key = randomBytes(32);
  await Bun.write(KEY_FILE, key);
  if (IS_WINDOWS) {
    console.warn("[contexter-vault] Windows does not support file permissions — ensure vault.key is in a user-only directory");
  } else {
    chmodSync(KEY_FILE, 0o600);
  }
  return key;
}

/** Load the vault encryption key from disk. Warns if permissions are too open. */
export async function loadKey(): Promise<Buffer> {
  const file = Bun.file(KEY_FILE);
  if (!(await file.exists())) {
    throw new Error(`Vault key not found at ${KEY_FILE}. Run: contexter-vault init`);
  }
  if (!IS_WINDOWS) {
    try {
      const mode = statSync(KEY_FILE).mode & 0o777;
      if (mode & 0o077) {
        console.warn(`[contexter-vault] WARNING: vault.key is accessible by other users (mode: ${mode.toString(8)}). Run: chmod 600 ${KEY_FILE}`);
      }
    } catch {}
  }
  const buf = await file.arrayBuffer();
  return Buffer.from(buf);
}

/** AES-256-GCM encrypt. Returns packed buffer: [IV 12B][AuthTag 16B][Ciphertext]. */
export function encrypt(plaintext: string, key: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]);
}

/** AES-256-GCM decrypt. Expects packed format from encrypt(). Throws on tamper/wrong key. */
export function decrypt(packed: Buffer, key: Buffer): string {
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
