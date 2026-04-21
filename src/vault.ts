import { join } from "path";
import { homedir } from "os";
import { encrypt, decrypt, loadKey, generateKey } from "./crypto";

const VAULT_DIR = join(homedir(), ".context-vault");
const VAULT_FILE = join(VAULT_DIR, "vault.enc");
const BUFFER_FILE = join(VAULT_DIR, "buffer.txt");

export { VAULT_DIR, BUFFER_FILE };

type VaultData = Record<string, string>;

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
    return JSON.parse(json) as VaultData;
  } catch (err) {
    console.error("[context-vault] failed to decrypt vault — wrong key or corrupted file:", err);
    throw new Error("Vault decryption failed. Check vault.key or reinitialize with: context-vault init");
  }
}

async function save(data: VaultData): Promise<void> {
  await ensureDir();
  const key = await loadKey();
  const packed = encrypt(JSON.stringify(data), key);
  await Bun.write(VAULT_FILE, packed);
}

export async function vaultSet(name: string, value: string): Promise<void> {
  const data = await load();
  const updated = { ...data, [name]: value };
  await save(updated);
}

export async function vaultGet(name: string): Promise<string | undefined> {
  const data = await load();
  return data[name];
}

export async function vaultHas(name: string): Promise<boolean> {
  const data = await load();
  return name in data;
}

export async function vaultList(): Promise<string[]> {
  const data = await load();
  return Object.keys(data);
}

export async function vaultAll(): Promise<VaultData> {
  return load();
}

export async function vaultDelete(name: string): Promise<boolean> {
  const data = await load();
  if (!(name in data)) return false;
  const { [name]: _, ...rest } = data;
  await save(rest);
  return true;
}

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

export async function wipeBuffer(): Promise<void> {
  try {
    await Bun.write(BUFFER_FILE, "");
  } catch {
    // ignore
  }
}

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
