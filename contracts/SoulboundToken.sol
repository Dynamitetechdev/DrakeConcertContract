// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A Contract To Purchase Ticket For Drake's Event
/// @author Dynamite

contract SoulboundToken is ERC721, Ownable {
    uint8 private soulBoundTokenCount;
    mapping (address => bool) private _isSoulbound;
    mapping (address => bool) private mintAccess;
    constructor() ERC721("DCCSoulboundToken", "$DST"){}


    function approve(address to, uint256 tokenId) public virtual override {}

    function setApprovalForAll(address operator, bool approved) public override {}

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {}


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {}

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public  override {}

    function safeMint(address to) external onlyOwner {
        if(to == address(0)) revert();
        if(!mintAccess[to]) revert("Access Denied");
        if(balanceOf(to) > 0 && ownerOf(soulBoundTokenCount) == to) revert('Token cannot be minted again');
        soulBoundTokenCount++;
        _isSoulbound[to] = true;
        _safeMint(to, soulBoundTokenCount);
    }

    function grantMintAccess(address minter) public returns(bool){
       return mintAccess[minter] = true;
    }

    function isSoulbound(address owner) public view returns(bool){
        return _isSoulbound[owner];
    }
}