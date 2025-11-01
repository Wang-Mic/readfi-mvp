require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x854264F2a58932b8DB325E11C0b3Fc1EBd4d3Ac7";
  const books = "0x59d36860fF3B64430D25804fd78687F82914EF92";
  const compliance = "0xf6106eDF81E7Be3E8B42866b74B2CDEd69cE1705";

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [books, compliance],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
