module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const startTime = Math.floor(Date.now() / 1000); //block.timestamp is measured by seconds in blockchain, so i convert the milleseconds to seconds using 1000
  const constructorArgs = [startTime];
  const DCC = await deploy("DrakeConcertContract", {
    from: deployer,
    args: constructorArgs,
    log: true,
  });
};
module.exports.tags = ["all", "DCC"];
