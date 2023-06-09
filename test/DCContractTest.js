const { expect, assert } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const chainId = network.config.chainId;
/**
 * The test for this contract was conducted on a small scale with a limited number of addresses and a maximum of 10 tickets to simulate the functionality of the contract.
 *
 * 1. MAX_TICKET_SALE = 10
 * 2. PRESALE_MAX = 5;
 * 3. SOULBOUND_MAX= 3;
 *
 *
 * ALL FUNCTIONS WERE TESTED
 *
 * 1. whiteListAddress()
 * 2. buyTicket()
 * 3. removeWhiteListedAddress()
 * 4. isWhiteListed()
 * 5. killContract()
 */
chainId != 31337
  ? describe.skip
  : describe("DrakeConcertContract", () => {
      let accounts, deployer, DCContract, END_DATE;
      const lessValue = ethers.utils.parseEther("0.9");
      const accurateValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["all"]);
        DCContract = await ethers.getContract("DrakeConcertContract");

        END_DATE = await DCContract.getEndTime();
        console.log(parseInt(END_DATE));
      });

      describe("Buy Ticket with a single address", () => {
        beforeEach(async () => {
          console.log("contract owner", await DCContract.getContractOwner());
          await DCContract.whiteListAddress([
            deployer.address,
            accounts[1].address,
          ]);

          const whiteListedAddresses = await DCContract.isWhiteListed(
            deployer.address
          );
          console.log("white listed addresses:", whiteListedAddresses);
        });

        it("should pass if TICKET_AMOUNT is accurate", async () => {
          const txBuyTicket = await DCContract.buyTicket({
            value: accurateValue,
          });
          const txBuyTicketReceipt = await txBuyTicket.wait(1);
          const { buyersAddress, ticketId } = txBuyTicketReceipt.events[2].args;

          console.log("ticket id", parseInt(ticketId));
          expect(buyersAddress).to.equal(deployer.address);
        });

        it("Should not allow purchase if 10 days has passed", async () => {
          //simulating The 10 days
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
          const numberOfAddresses = 6;
          const startingIndex = 1;

          for (let i = startingIndex; i < numberOfAddresses; i++) {
            await DCContract.whiteListAddress([accounts[i].address]);

            const DDContractWConnectedAccounts = await DCContract.connect(
              accounts[i]
            );
            await DDContractWConnectedAccounts.buyTicket({
              value: accurateValue,
            });

            const whiteListedAddresses = await DCContract.isWhiteListed(
              accounts[i].address
            );

            // const getCount = await DCContract.getWhiteListedCount();
            // console.log("count", getCount);
            const hasSoulBoundToken = await DCContract.hasSoulBoundToken(
              accounts[i].address
            );
            console.log("has soulbound token:", hasSoulBoundToken);
            console.log("Is WhiteListedgg:", whiteListedAddresses);
          }

          /// Buying Ticket after the pre-sale
          const anotherUser = accounts[9];
          const connectedAnotherUserWDDContract = await DCContract.connect(
            anotherUser
          );

          const anotherUserTx = await connectedAnotherUserWDDContract.buyTicket(
            {
              value: accurateValue,
            }
          );

          await expect(anotherUserTx).to.emit(DCContract, "TicketBought");
        });
      });

      describe("Remove Addresses from been whitelisted", () => {
        it("remove addresses from been whiteListed", async () => {
          const numberOfAddresses = 5;
          const startingIndex = 1;

          for (let i = startingIndex; i <= numberOfAddresses; i++) {
            await DCContract.whiteListAddress([accounts[i].address]);
          }

          await DCContract.removeWhiteListedAddress([
            accounts[4].address,
            accounts[3].address,
          ]);

          console.log(
            "Is WhiteListed:",
            await DCContract.isWhiteListed(accounts[4].address)
          );

          const res = await DCContract.isWhiteListed(accounts[3].address);
          assert(!res);
        });
      });

      describe("Kill Contract and transfer remaining balance to the contract owner", () => {
        beforeEach(async () => {
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
          }
        });

        it("Should Kill the Contract and Contract Balance should be empty, since the 10 days has elasped and all ticket has been sold", async () => {
          // ============ Emulating 10 days ========== //
          await network.provider.request({
            method: "evm_increaseTime",
            params: [parseInt(END_DATE) + 1],
          });

          await network.provider.request({ method: "evm_mine", params: [] });

          // ============ Emulating 10 days ========== //
          const contractBalanceBeforeKill =
            await DCContract.getContractBalance();

          console.log(
            "contract Balance Before Kill",
            ethers.utils.formatEther(contractBalanceBeforeKill)
          );

          await DCContract.killContract();

          const contractBalanceAfterKill = await ethers.provider.getBalance(
            DCContract.address
          );

          console.log(
            "contractBalanceAfterKill",
            ethers.utils.formatEther(contractBalanceAfterKill)
          );

          assert((await ethers.provider.getBalance(DCContract.address)) == 0);
        });
      });
    });
