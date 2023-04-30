const { run } = require("hardhat");
const verify = async (args, address) => {
  await run("verify:verify", {
    address: address,
    constructorArguments: args,
  });
};

module.exports = {
  verify,
};
