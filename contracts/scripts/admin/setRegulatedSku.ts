import { ethers } from "hardhat";

async function main() {
  const skuId = Number(process.env.SKU_ID || "1002"); // 要設為合規的 SKU
  const gw = process.env.MINT_GATEWAY!;
  const gwContract = await ethers.getContractAt("ReadFiMintGateway", gw);
  const tx = await gwContract.setRegulatedSku(skuId, true);
  await tx.wait();
  console.log(`✅ regulatedSku[${skuId}] = true`);
}

main().catch((e)=>{console.error(e);process.exitCode=1});
