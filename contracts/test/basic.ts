import { expect } from "chai";
import { ethers } from "hardhat";

describe("Basic compile & deploy", function () {
  it("deploys READ and mints sample", async () => {
    const [owner, user] = await ethers.getSigners();
    const READ = await ethers.getContractFactory("READToken");
    const read = await READ.deploy(owner.address);
    await read.waitForDeployment();
    await read.mint(user.address, ethers.parseEther("100"));
    expect(await read.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
  });
});
