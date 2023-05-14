const { ethers, network } = require("hardhat");
const fs = require("fs");
const FRONTEND_ABI = "../frontend/constants/ABI.json";
const FRONTEND_CONTRACT_ADDRESS =
  "../frontend/constants/contractAddresses.json";

const updateABI = async () => {
  const concertContract = await ethers.getContract("DrakeConcertContract");
  fs.writeFileSync(
    FRONTEND_ABI,
    concertContract.interface.format(ethers.utils.FormatTypes.json)
  );
};

const updateContractAddresses = async () => {
  const chainId = network.config.chainId;
  const concertContract = await ethers.getContract("DrakeConcertContract");
  const contractAddressFile = JSON.parse(
    fs.readFileSync(FRONTEND_CONTRACT_ADDRESS, "utf8")
  );

  if (chainId in contractAddressFile) {
    if (!contractAddressFile[chainId].includes(concertContract.address)) {
      contractAddressFile[chainId].push(concertContract.address);
    }
  } else {
    contractAddressFile[chainId] = [concertContract.address];
  }

  fs.writeFileSync(
    FRONTEND_CONTRACT_ADDRESS,
    JSON.stringify(contractAddressFile)
  );
};
module.exports = {
  updateABI,
  updateContractAddresses,
};
