import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ComplianceGateway with account:", deployer.address);

  const Contract = await ethers.getContractFactory("ComplianceGateway");
  const gateway = await Contract.deploy();
  await gateway.waitForDeployment();

  console.log("✅ ComplianceGateway deployed to:", await gateway.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
