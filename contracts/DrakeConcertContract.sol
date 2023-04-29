// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
error DrakeConcertContract_addrCannotBeZeroAddress();
error DrakeConcertContract_inAccuratePrice();
error DrakeConcertContract_saleHasNotStarted();
error DrakeConcertContract_notWhiteListed();
error DrakeConcertContract_salesHasEnded();
error DrakeConcertContract_WhiteListMax();
contract DrakeConcertContract is ERC721Enumerable, Ownable{
    uint256 private startTime;
    uint256 private endTime;
    uint256 private constant MAX_TICKET_SALE = 1000;
    uint256 private constant PRESALE_MAX = 200;
    uint256 private preSaleCount;
    uint256 private constant SOULBOUND_MAX= 20;
    uint256 private soulboundCount;
    uint256 private constant TICKET_AMOUNT = 1 ether;
    address[] private _whiteListedAddresses;
    uint256 private ticketCount = totalSupply() + 1;

    mapping (address => bool) private whiteListed;

    event TicketBought(address indexed buyersAddress, uint256 indexed ticketId);
    event soulboundTicket(address indexed buyersAddress, uint256 indexed ticketId);
    event addressWhiteListed(address[] indexed allListedAddress);

    constructor(uint256 _startTime) ERC721("DrakeConcertContract", "$DCC") {
         startTime = _startTime;
         endTime = _startTime + 10 days;
    }

    function buyTicket() external payable{
        if(msg.sender == address(0)) revert DrakeConcertContract_addrCannotBeZeroAddress(); 
        if(msg.value != TICKET_AMOUNT) revert DrakeConcertContract_inAccuratePrice();
        if(block.timestamp >= endTime) revert DrakeConcertContract_saleHasNotStarted();
        if(totalSupply() == MAX_TICKET_SALE) revert DrakeConcertContract_salesHasEnded();

        if(preSaleCount < PRESALE_MAX){
            if(!whiteListed[msg.sender]) revert DrakeConcertContract_notWhiteListed();
            preSaleCount++;
        }

        if(soulboundCount < SOULBOUND_MAX && totalSupply() <= SOULBOUND_MAX){
            soulboundCount++;
            emit soulboundTicket(msg.sender, ticketCount);
            return _safeMint(msg.sender, ticketCount);
        }
        _safeMint(msg.sender, ticketCount);
        emit TicketBought(msg.sender, ticketCount);
    }

    function whiteListAddress(address[] memory addresses) external onlyOwner{

        if(_whiteListedAddresses.length >= PRESALE_MAX) revert DrakeConcertContract_WhiteListMax();

        for (uint256 i = 0; i < addresses.length; i++) {
            whiteListed[addresses[i]] = true;
            _whiteListedAddresses.push(addresses[i]);
        }
    }

    function getWhiteListedAddress() external view onlyOwner returns(address[] memory) {
        return _whiteListedAddresses;
    }


    function getEndTime() external view returns(uint256) {
        return endTime;
    }
}