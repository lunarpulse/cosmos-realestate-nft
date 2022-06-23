// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./ERC721Mintable.sol";

/// @title CRNFT
/// @author Gordon
/// @notice Mints CRNFT
/// @dev using ERC721 Meta data
contract CRNFT is ERC721Metadata {
    constructor()
        public
        ERC721Metadata(
            "Cosmos' Realestate NFT",
            "cRNFT",
            "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/"
        )
    {}

    function mint(address to, uint256 tokenId)
        public
        onlyOwner
        whenNotPaused
        returns (bool retVal)
    {
        retVal = false;
        _mint(to, tokenId);
        _setTokenURI(tokenId);
        retVal = true;
    }
}
