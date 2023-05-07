// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A Contract To Purchase Ticket For Drake's Event
/// @author Dynamite

contract SoulboundToken is ERC721, Ownable {
    uint8 private soulBoundTokenCount;
    mapping (address => bool) private _isSoulbound;

    constructor() ERC721("DCCSoulboundToken", "$DST"){}

    function safeMint(address to) public{
        if(to == address(0)) revert();
        soulBoundTokenCount++;
        _isSoulbound[to] = true;
        _safeMint(to, soulBoundTokenCount);
    }

    function _transfer(address from, address to, uint256) pure internal override{
        if(from != address(0) && to != address(0)) revert("Token Cannot Be Transfer");
    }

    function isSoulbound(address owner) public view returns(bool){
        return _isSoulbound[owner];
    }
}