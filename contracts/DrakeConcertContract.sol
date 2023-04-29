// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

error DrakeConcertContract_cannotBeZeroAddress();
error DrakeConcertContract_inAccuratePrice();
error DrakeConcertContract_saleHasNotStarted();
error DrakeConcertContract_notWhiteListed();
error DrakeConcertContract_salesHasEnded();

contract DrakeConcertContract is ERC721,ERC721Enumerable{
    uint256 private startTime;
    uint256 private endTime;
    uint256 private constant MAX_TICKET_SALE = 1000;
    uint256 private constant PRESALE_MAX = 200;
    uint256 private preSaleCount;
    uint256 private constant SOULBOUND_MAX= 20;
    uint256 private soulboundCount;
    uint256 private constant TICKET_AMOUNT = 1 ether;

    mapping (address => bool) private whiteListed;

    constructor(uint256 _startTime) ERC721("DrakeConcertContract", "$DCC") {
         startTime = _startTime;
         endTime = _startTime + 10 days;
    }

    function buyTicket() external payable{
        if(msg.sender == address(0)) revert DrakeConcertContract_addrCannotBeZeroAddress(); 
        if(msg.value != TICKET_AMOUNT) revert DrakeConcertContract_inAccuratePrice();
        if(block.timestamp > endTime) revert DrakeConcertContract_saleHasNotStarted();
        if(totalSupply() == MAX_TICKET_SALE) revert DrakeConcertContract_salesHasEnded();

        if(preSaleCount < PRESALE_MAX){
            if(msg.sender != whiteListed[msg.sender]) revert DrakeConcertContract_notWhiteListed();
            preSaleCount++;
        }

        if(soulboundCount < SOULBOUND_MAX && totalSupply() <= SOULBOUND_MAX){
            soulboundCount++;
            return _safeMint(msg.sender, totalSupply() + 1);
        }
        _safeMint(msg.sender, totalSupply() + 1);
    }
}