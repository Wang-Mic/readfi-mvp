import { DID } from "dids";
import KeyResolver from "key-did-resolver";

// 用於前端傳回的 VC 憑證驗證
export async function verifyVC(vc) {
  try {
    // 從 VC 內提取 DID 與 Payload
    const { payload, signatures } = vc;
    const did = new DID({ resolver: KeyResolver.getResolver() });
    const kid = signatures[0].protected.kid;
    const issuer = kid.split("#")[0];

    // 驗證 VC 簽章
    const verified = await did.verifyJWS(vc);
    if (!verified) throw new Error("❌ VC 簽章驗證失敗");

    // 檢查角色或屬性
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.credentialSubject.role !== "verified-reader") {
      throw new Error("❌ 使用者角色不符：需 verified-reader");
    }

    console.log("✅ VC 驗證成功，DID：", issuer);
    return { valid: true, issuer, data };
  } catch (err) {
    console.error("VC 驗證失敗：", err.message);
    return { valid: false, error: err.message };
  }
}
