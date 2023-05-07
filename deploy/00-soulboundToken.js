const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const chainId = network.config.chainId;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const constructorArgs = [];
  const soulboundTokenContract = await deploy("SoulboundToken", {
    from: deployer,
    args: constructorArgs,
    log: true,
  });

  if (chainId != 31337 && process.env.ETHER_SCAN_API_KEY) {
    await verify(constructorArgs, soulboundToken.address);
  }
};

module.exports.tags = ["all", "soulbound"];
