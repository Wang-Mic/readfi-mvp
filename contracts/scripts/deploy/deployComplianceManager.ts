import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ReadFiComplianceManager with account:", deployer.address);

  // 暫時用自己當作 OPL 地址；之後可改 setOPL()
  const oplAddress = deployer.address;

  const Factory = await ethers.getContractFactory("ReadFiComplianceManager");
  const contract = await Factory.deploy(oplAddress);
  await contract.waitForDeployment();

  console.log("✅ ReadFiComplianceManager deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
