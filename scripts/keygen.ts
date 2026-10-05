import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");

// Raw 32-byte public key (what CryptoKit's Curve25519.Signing.PublicKey expects), base64.
const publicRaw = publicKey.export({ format: "der", type: "spki" }).subarray(-32).toString("base64");
const privatePem = privateKey.export({ format: "pem", type: "pkcs8" }).toString();

console.log("# Put this in your server environment (keep it secret):");
console.log(`LICENSE_PRIVATE_KEY="${privatePem.trim().replace(/\n/g, "\\n")}"`);
console.log("");
console.log("# Put this in the app, LicenseConfig.publicKey (safe to commit):");
console.log(publicRaw);
