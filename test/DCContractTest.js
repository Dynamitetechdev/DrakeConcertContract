const { expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");

describe("", () => {
  let accounts, deployer, DCContract, END_DATE;
  const lessValue = ethers.utils.parseEther("0.9");
  const accurateValue = ethers.utils.parseEther("1");

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    await deployments.fixture(["all"]);
    DCContract = await ethers.getContract("DrakeConcertContract");
    // console.log("DCContract Address:", DCContract.address);

    END_DATE = await DCContract.getEndTime();
    console.log(parseInt(END_DATE));
  });

  describe("Buy Ticket with a single address", () => {
    beforeEach(async () => {
      await DCContract.whiteListAddress([
        deployer.address,
        accounts[1].address,
      ]);
      const whiteListedAddresses = await DCContract.getWhiteListedAddress();
      console.log("white listed addresses:", whiteListedAddresses);
    });

    it("should pass if TICKET_AMOUNT is accurate & emit the address that purchased", async () => {
      const txBuyTicket = await DCContract.buyTicket({ value: accurateValue });
      const txBuyTicketReceipt = await txBuyTicket.wait(1);
      const { buyersAddress, ticketId } = txBuyTicketReceipt.events[0].args;
      console.log(parseInt(ticketId));

      await expect(txBuyTicket).to.emit(DCContract, "soulboundTicket");
      expect(buyersAddress).to.equal(deployer.address);
    });

    it("Should not allow purchase if 10 days has passed", async () => {
      //Emulating The 10 days
      await network.provider.request({
        method: "evm_increaseTime",
        params: [parseInt(END_DATE) + 1],
      });
      await network.provider.request({ method: "evm_mine", params: [] });

      // Trying to get a Ticket after 10 days
      await expect(
        DCContract.buyTicket({
          value: accurateValue,
        })
      ).to.be.revertedWith("DrakeConcertContract_saleHasNotStarted");
    });
  });

  describe("Buy Ticket with a multiple address", () => {
    it("should allow address get Ticket in general sale after pre-sale is completed", async () => {
      const numberOfAddresses = 5;
      const startingIndex = 1;
      for (let i = startingIndex; i <= numberOfAddresses; i++) {
        await DCContract.whiteListAddress([accounts[i].address]);

        const DDContractWConnectedAccounts = await DCContract.connect(
          accounts[i]
        );

        await DDContractWConnectedAccounts.buyTicket({
          value: accurateValue,
        });
        console.log("Address", DDContractWConnectedAccounts.address);
      }

      const whiteListedAddresses = await DCContract.getWhiteListedAddress();
      console.log("white listed addresses:", whiteListedAddresses);

      /// Buying Ticket after the pre-sale
      const anotherUser = accounts[9];
      const connectedAnotherUserWDDContract = await DCContract.connect(
        anotherUser
      );

      const anotherUserTx = await connectedAnotherUserWDDContract.buyTicket({
        value: accurateValue,
      });

      await expect(anotherUserTx).to.emit(DCContract, "TicketBought");
    });
  });
});
