import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ReadFiMintGateway with account:", deployer.address);

  const BOOKS1155 = process.env.BOOKS1155_ADDRESS;
  const COMPLIANCE_MANAGER = process.env.COMPLIANCE_MANAGER;

  if (!BOOKS1155) throw new Error("❌ BOOKS1155_ADDRESS not set in .env");
  if (!COMPLIANCE_MANAGER) throw new Error("❌ COMPLIANCE_MANAGER not set in .env");

  const Factory = await ethers.getContractFactory("ReadFiMintGateway");
  const gateway = await Factory.deploy(BOOKS1155, COMPLIANCE_MANAGER);
  await gateway.waitForDeployment();

  console.log("✅ ReadFiMintGateway deployed to:", await gateway.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
