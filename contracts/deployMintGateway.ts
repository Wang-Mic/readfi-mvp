import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ReadFiMintGateway with account:", deployer.address);

  // ✅ 從 .env 讀取 Compliance Manager
  const COMPLIANCE_MANAGER = process.env.COMPLIANCE_MANAGER;
  if (!COMPLIANCE_MANAGER) {
    throw new Error("❌ COMPLIANCE_MANAGER not set in .env");
  }

  const Factory = await ethers.getContractFactory("ReadFiMintGateway");
  const gateway = await Factory.deploy(COMPLIANCE_MANAGER);
  await gateway.waitForDeployment();

  console.log("✅ ReadFiMintGateway deployed to:", await gateway.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
