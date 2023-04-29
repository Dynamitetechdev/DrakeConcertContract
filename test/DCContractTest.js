const { expect } = require("chai");
const { deployments, ethers } = require("hardhat");

describe("", () => {
  let accounts, deployer, DCContract;
  const lessValue = ethers.utils.parseEther("0.9");
  const accurateValue = ethers.utils.parseEther("1");
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    await deployments.fixture(["all"]);
    DCContract = await ethers.getContract("DrakeConcertContract");
    console.log("DCContract Address:", DCContract.address);
  });

  describe("Buy Ticket", () => {
    it("Should Return an error if Value is less than TICKET_AMOUNT", async () => {
      await DCContract.whiteListAddress([deployer.address]);

      const whiteListedAddresses = await DCContract.getWhiteListedAddress();
      console.log("white listed addresses:", whiteListedAddresses);

      const txBuyTicket = await DCContract.buyTicket({ value: accurateValue });
      await expect(txBuyTicket).to.emit(DCContract, "TicketBought");
    });
  });
});
