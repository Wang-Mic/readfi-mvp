import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const READ = await ethers.getContractFactory("READToken");
  const read = await READ.deploy(deployer.address);
  await read.waitForDeployment();
  console.log("READToken:", await read.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
