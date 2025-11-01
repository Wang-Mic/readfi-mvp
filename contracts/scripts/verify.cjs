const { run } = require("hardhat");

async function main() {
  const list = [
    "0xf6106eDF81E7Be3E8B42866b74B2CDEd69cE1705" // ← 換成你的合約地址
  ];
  for (const addr of list) {
    console.log(`🔍 Verifying ${addr} ...`);
    try {
      await run("verify:verify", { address: addr, constructorArguments: [] });
      console.log(`✅ Verified: ${addr}`);
    } catch (e) {
      console.error(`❌ Failed: ${addr} -> ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
