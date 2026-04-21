import { join } from "path";
import { homedir } from "os";

export const VAULT_DIR = join(homedir(), ".contexter-vault");
