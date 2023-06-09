// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;

/// @title A Contract To Purchase Ticket For Drake's Event
/// @author Dynamite

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulboundToken.sol";
error DrakeConcertContract_addrCannotBeZeroAddress();
error DrakeConcertContract_inAccuratePrice();
error DrakeConcertContract_saleHasNotStarted();
error DrakeConcertContract_notWhiteListed();
error DrakeConcertContract_salesHasEnded();
error DrakeConcertContract_WhiteListMax();
error DrakeConcertContract_saleHasNotEnded();
error DrakeConcertContract_AlreadyWhiteListed();

contract DrakeConcertContract is ERC721Enumerable, Ownable {
    // ======= STATE VARIABLES ========//
    address private contractOwner;
    uint256 private startTime;
    uint256 private endTime;
    uint32 private constant MAX_TICKET_SALE = 1000;
    uint32 private ticketSaleCount;
    uint16 private constant PRESALE_MAX = 200;
    uint16 private preSaleCount;
    uint16 private constant SOULBOUND_MAX = 20;
    uint16 private soulboundCount;
    uint256 private constant TICKET_AMOUNT = 1 ether;
    uint8 public whiteListedCounter;

    SoulboundToken private sContract;
    // ======= MAPPINGS ========//
    mapping(address => bool) private whiteListed;

    // ======= EVENTS ========//
    event TicketBought(address indexed buyersAddress, uint256 indexed ticketId);
    event SoulboundTicket(
        address indexed buyersAddress,
        uint256 indexed ticketId
    );
    event endTimeEvent(uint256 _endTime);

    /**
     * @param _startTime set the start time of the ticket sale
     */

    constructor(uint256 _startTime) ERC721("DrakeConcertContract", "$DCC") {
        contractOwner = msg.sender;
        sContract = new SoulboundToken();
        startTime = _startTime;
        endTime = _startTime + 10 days;
        emit endTimeEvent(endTime);
    }

    // ======= EXETERNAL FUNCTIONS ========//

    /// @dev This function is used to buy tickets for a Drake concert
    function buyTicket() external payable {
        if (msg.sender == address(0))
            revert DrakeConcertContract_addrCannotBeZeroAddress();
        if (msg.value != TICKET_AMOUNT)
            revert DrakeConcertContract_inAccuratePrice();
        if (block.timestamp >= endTime)
            revert DrakeConcertContract_saleHasNotStarted();
        if (totalSupply() == MAX_TICKET_SALE)
            revert DrakeConcertContract_salesHasEnded();

        if (preSaleCount < PRESALE_MAX) {
            if (!whiteListed[msg.sender])
                revert DrakeConcertContract_notWhiteListed();
            preSaleCount++;
        }

        if (soulboundCount < SOULBOUND_MAX && totalSupply() < SOULBOUND_MAX) {
            soulboundCount++;
            sContract.grantMintAccess(msg.sender);
            sContract.safeMint(msg.sender);
        }

        _safeMint(msg.sender, totalSupply() + 1);
        ticketSaleCount++;
        emit TicketBought(msg.sender, totalSupply() + 1);
    }

    /**
     * @dev Whitelist Addresses for presale
     * @param addresses Addresses to be whitelisted for Pre-sale
     */
    function whiteListAddress(address[] memory addresses) external onlyOwner {
        uint8 len = uint8(addresses.length);

        if ((whiteListedCounter + len) > PRESALE_MAX)
            revert("Whitelisted Has Reach its max");

        for (uint256 i = 0; i < addresses.length; i++) {
            if (isWhiteListed(addresses[i])) continue;
            whiteListed[addresses[i]] = true;
            whiteListedCounter++;
        }
    }

    /**
     * @dev Removes Whitelisted Addresses
     * @param addresses Addresses to be removed from the whitelist
     */

    function removeWhiteListedAddress(
        address[] memory addresses
    ) external onlyOwner {
        uint8 len = uint8(addresses.length);

        if (len > whiteListedCounter) revert("can only remove 20 address");

        for (uint256 i = 0; i < addresses.length; i++) {
            if (!whiteListed[addresses[i]]) continue;
            whiteListed[addresses[i]] = false;
            whiteListedCounter--;
        }
    }

    /**
     * @dev checks if an address is whitelisted or not
     * @param _address address to be checked
     */
    function isWhiteListed(address _address) public view returns (bool) {
        return whiteListed[_address];
    }

    /// @dev kills the contract purchase are done, and transfer the remaining balance to the contract owner
    function killContract() external onlyOwner {
        if (block.timestamp < endTime && totalSupply() < MAX_TICKET_SALE)
            revert DrakeConcertContract_saleHasNotEnded();
        selfdestruct(payable(owner()));
    }

    function hasSoulBoundToken(address owner) public view returns (bool) {
        return sContract.isSoulbound(owner);
    }

    // ======= GETTER FUNCTIONS ========//

    /// @dev returns all whitelisted addresses
    function getWhiteListedCount() public view returns (uint8) {
        return whiteListedCounter;
    }

    /// @dev returns the end time of purchase
    function getEndTime() public view returns (uint256) {
        return endTime;
    }

    /// @dev returns the maximum amount of ticket that can be purchased
    function getMaxTicketAmount() public pure returns (uint32) {
        return MAX_TICKET_SALE;
    }

    /// @dev returns the maximum presale ticket sale
    function getPresaleMaxAmount() public pure returns (uint16) {
        return PRESALE_MAX;
    }

    /// @dev returns the count of each presale acquired
    function getPreSaleCounter() public view returns (uint16) {
        return preSaleCount;
    }

    /// @dev returns the Maximum of soulbounds
    function getMaxSoulNBoundTicket() public pure returns (uint16) {
        return SOULBOUND_MAX;
    }

    /// @dev returns the count of each soulbount received
    function getMaxSoulNBoundCounter() public view returns (uint16) {
        return soulboundCount;
    }

    /// @dev returns the amount of ticket price
    function getTicketPrice() public pure returns (uint256) {
        return TICKET_AMOUNT;
    }

    function getTicketSaleCount() public view returns (uint32) {
        return ticketSaleCount;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getContractOwner() public view returns (address) {
        return contractOwner;
    }
}
