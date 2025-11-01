import { ethers, upgrades, network } from "hardhat";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

const SAVE_PATH = path.resolve(__dirname, "../../deployments/complianceManager.json");

async function main() {
  console.log(`🚀 Network: ${network.name}`);

  const ContractName = "ReadFiComplianceManagerV2";
  const Factory = await ethers.getContractFactory(ContractName);

  // 讀取現有部署紀錄
  let store: any = {};
  if (fs.existsSync(SAVE_PATH)) {
    store = JSON.parse(fs.readFileSync(SAVE_PATH, "utf8"));
  }
  const current = store[network.name] || {};

  const OPL = process.env.OPL_ADDRESS;
  const GATEWAY = process.env.GATEWAY_ADDRESS;

  if (!OPL || !/^0x[0-9a-fA-F]{40}$/.test(OPL)) {
    throw new Error(`❌ Invalid OPL_ADDRESS: ${OPL}`);
  }
  if (!GATEWAY || !/^0x[0-9a-fA-F]{40}$/.test(GATEWAY)) {
    throw new Error(`❌ Invalid GATEWAY_ADDRESS: ${GATEWAY}`);
  }

  if (current.proxy) {
    console.log(`🔄 Found proxy at ${current.proxy}, upgrading...`);
    const upgraded = await upgrades.upgradeProxy(current.proxy, Factory);
    await upgraded.waitForDeployment();
    const implAddress = await upgrades.erc1967.getImplementationAddress(await upgraded.getAddress());
    console.log(`✅ Upgraded: ${await upgraded.getAddress()}`);
    console.log(`ℹ️ Implementation: ${implAddress}`);

    store[network.name] = {
      ...current,
      contract: ContractName,
      proxy: await upgraded.getAddress(),
      implementation: implAddress,
      upgradedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SAVE_PATH, JSON.stringify(store, null, 2));
  } else {
    console.log("🆕 Deploying new proxy...");
    const instance = await upgrades.deployProxy(Factory, [OPL, GATEWAY], {
      kind: "uups",
      initializer: "initialize",
    });
    await instance.waitForDeployment();

    const proxyAddr = await instance.getAddress();
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddr);

    console.log(`✅ Proxy deployed at: ${proxyAddr}`);
    console.log(`ℹ️ Implementation: ${implAddress}`);

    store[network.name] = {
      contract: ContractName,
      proxy: proxyAddr,
      implementation: implAddress,
      deployedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SAVE_PATH, JSON.stringify(store, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
