const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const chainId = network.config.chainId;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  // const soulboundTokenContract = await ethers.getContract("SoulboundToken");
  // console.log("Soul bound token address:", soulboundTokenContract.address);

  const startTime = Math.floor(Date.now() / 1000); //block.timestamp is measured by seconds in blockchain, so i convert the milleseconds to seconds using 1000
  const constructorArgs = [startTime];
  const DCContract = await deploy("DrakeConcertContract", {
    from: deployer,
    args: constructorArgs,
    log: true,
  });

  if (chainId != 31337 && process.env.ETHER_SCAN_API_KEY) {
    await verify(constructorArgs, DCContract.address);
  }
};

module.exports.tags = ["all", "DCC"];
