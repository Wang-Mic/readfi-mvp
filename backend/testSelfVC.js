import { DID } from "dids";
import KeyResolver from "key-did-resolver";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { randomBytes } from "crypto";

// 隨機產生一個 Ed25519 金鑰
const seed = randomBytes(32);

// 建立 DID Provider
const provider = new Ed25519Provider(seed);
const did = new DID({
  provider,
  resolver: KeyResolver.getResolver(),
});

// 驗證 DID
await did.authenticate();

console.log("✅ DID 驗證成功：", did.id);

// 建立一個 Verifiable Credential (VC)
const credential = await did.createJWS({
  type: "VerifiableCredential",
  credentialSubject: {
    role: "verified-reader",
    issued: new Date().toISOString(),
  },
});

console.log("✅ VC 建立完成：");
console.log(JSON.stringify(credential, null, 2));
