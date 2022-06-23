// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./verifier.sol";
import "./ERC721Mintable.sol";

contract SolnSquareVerifier is CRNFT {
    struct Solution {
        uint256 index;
        address solver;
        bytes32 key;
    }

    Solution[] private _solutions;
    mapping(bytes32 => bool) private _uniqueSolutions;
    event SolutionAdded(uint256 index, address solver, bytes32 key);

    Verifier private _verifier;

    constructor(address verifier) public {
        _verifier = Verifier(verifier);
    }

    function isUniqueSolution(bytes32 key) internal view returns (bool) {
        return _uniqueSolutions[key];
    }

    function _addSolution(uint256 index, bytes32 key) internal {
        _solutions.push(Solution({index: index, solver: msg.sender, key: key}));
        _uniqueSolutions[key] = true;
        emit SolutionAdded(index, msg.sender, key);
    }

    function mintNewCRNFT(
        uint256 tokenId,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public {
        require(
            _verifier.verifyTx(
                Verifier.Proof({
                    a: Pairing.G1Point(a[0], a[1]),
                    b: Pairing.G2Point(b[0], b[1]),
                    c: Pairing.G1Point(c[0], c[1])
                }),
                input
            ),
            "Invalid Solution params"
        );
        bytes32 key = keccak256(abi.encodePacked(a, b, c, input));
        require(!isUniqueSolution(key), "Already used solution");
        _addSolution(tokenId, key);
    }
}