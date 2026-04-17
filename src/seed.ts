import { initVault, vaultSet, vaultGet, vaultList } from "./vault";

await initVault();
await vaultSet("test-key", "SUPERSECRET12345");
console.log("Stored encrypted secret");
console.log("Keys:", await vaultList());
const retrieved = await vaultGet("test-key");
console.log("Retrieved:", retrieved);
console.log("Match:", retrieved === "SUPERSECRET12345");
