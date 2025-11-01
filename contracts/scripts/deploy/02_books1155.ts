import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const baseURI = "https://gateway.pinata.cloud/ipfs/bafybeif4w6faaye2zbth7t5l4fcw4ita4f5h6um2gp57pg22vaniwxvm2a/{id}.json";

  const Books = await ethers.getContractFactory("ReadFiBooks1155");
  const books = await Books.deploy(baseURI, deployer.address);
  await books.waitForDeployment();
  console.log("ReadFiBooks1155:", await books.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
