import { join } from "path";
import { encrypt, decrypt, loadKey, generateKey } from "./crypto";
import { VAULT_DIR } from "./constants";
const VAULT_FILE = join(VAULT_DIR, "vault.enc");
const BUFFER_FILE = join(VAULT_DIR, "buffer.txt");

export { VAULT_DIR, BUFFER_FILE };

const VAULT_FORMAT_VERSION = 1;

type VaultData = Record<string, string>;
type VaultEnvelope = { _version: number; secrets: VaultData };

async function ensureDir(): Promise<void> {
  await Bun.write(join(VAULT_DIR, ".keep"), "");
}

async function load(): Promise<VaultData> {
  const file = Bun.file(VAULT_FILE);
  if (!(await file.exists())) return {};
  const packed = Buffer.from(await file.arrayBuffer());
  if (packed.length === 0) return {};
  const key = await loadKey();
  try {
    const json = decrypt(packed, key);
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && "_version" in parsed) {
      const envelope = parsed as VaultEnvelope;
      return envelope.secrets;
    }
    return parsed as VaultData;
  } catch (err) {
    console.error("[contexter-vault] failed to decrypt vault — wrong key or corrupted file:", err);
    throw new Error("Vault decryption failed. Check vault.key or reinitialize with: contexter-vault init");
  }
}

async function save(data: VaultData): Promise<void> {
  await ensureDir();
  const key = await loadKey();
  const envelope: VaultEnvelope = { _version: VAULT_FORMAT_VERSION, secrets: data };
  const packed = encrypt(JSON.stringify(envelope), key);
  const tmpFile = VAULT_FILE + ".tmp";
  await Bun.write(tmpFile, packed);
  const { renameSync } = await import("fs");
  renameSync(tmpFile, VAULT_FILE);
}

/** Store a secret in the encrypted vault. Creates or overwrites. */
export async function vaultSet(name: string, value: string): Promise<void> {
  const data = await load();
  const updated = { ...data, [name]: value };
  await save(updated);
}

/** Retrieve a secret by name. Returns undefined if not found. */
export async function vaultGet(name: string): Promise<string | undefined> {
  const data = await load();
  return data[name];
}

/** Check if a secret exists in the vault. */
export async function vaultHas(name: string): Promise<boolean> {
  const data = await load();
  return name in data;
}

/** List all secret names in the vault. */
export async function vaultList(): Promise<string[]> {
  const data = await load();
  return Object.keys(data);
}

/** Return all secrets as a name→value map. Used by the proxy to load redaction targets. */
export async function vaultAll(): Promise<VaultData> {
  return load();
}

/** Remove a secret. Returns true if it existed. */
export async function vaultDelete(name: string): Promise<boolean> {
  const data = await load();
  if (!(name in data)) return false;
  const { [name]: _, ...rest } = data;
  await save(rest);
  return true;
}

/** Read the plaintext buffer file (used by `contexter-vault add` for non-interactive input). */
export async function readBuffer(): Promise<string | null> {
  try {
    const file = Bun.file(BUFFER_FILE);
    if (!(await file.exists())) return null;
    const content = (await file.text()).trim();
    if (content.length === 0) return null;
    return content;
  } catch {
    return null;
  }
}

/** Securely wipe the buffer file: overwrite with random bytes, then truncate. */
export async function wipeBuffer(): Promise<void> {
  try {
    const file = Bun.file(BUFFER_FILE);
    if (!(await file.exists())) return;
    const size = file.size;
    if (size > 0) {
      const { randomBytes } = await import("crypto");
      await Bun.write(BUFFER_FILE, randomBytes(size));
    }
    await Bun.write(BUFFER_FILE, "");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ENOENT")) return;
    console.error(`[contexter-vault] wipeBuffer failed: ${msg}`);
  }
}

/** Initialize the vault directory and generate an encryption key if none exists. */
export async function initVault(): Promise<void> {
  await ensureDir();
  const keyFile = Bun.file(join(VAULT_DIR, "vault.key"));
  if (await keyFile.exists()) {
    console.log("Vault key already exists, skipping key generation");
  } else {
    await generateKey();
    console.log("Generated vault key");
  }
  console.log(`Vault initialized at ${VAULT_DIR}`);
}
