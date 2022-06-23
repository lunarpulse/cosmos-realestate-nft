// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./Verifier.sol";
import "./CRNFT.sol";

contract SolnSquareVerifier is CRNFT, Verifier {
    struct Solution {
        address solver;
        bytes32 key;
    }

    Solution[] private _solutions;
    mapping(bytes32 => bool) private _uniqueSolutions;
    event SolutionAdded(address solver, bytes32 key);

    function isUniqueSolution(bytes32 key) public view returns (bool) {
        return !_uniqueSolutions[key];
    }

    function addSolution(
        address to,
        Verifier.Proof memory proof,
        uint256[2] memory input
    ) external returns (bool) {
        (
            uint256[2] memory a,
            uint256[2][2] memory b,
            uint256[2] memory c
        ) = unpackProof(proof);

        bytes32 key = buildKey(to, a, b, c, input);
        require(isUniqueSolution(key), "Already used solution");

        _addSolution(key);

        return true;
    }

    function _addSolution(bytes32 key) internal {
        _solutions.push(Solution({solver: msg.sender, key: key}));
        _uniqueSolutions[key] = true;

        emit SolutionAdded(msg.sender, key);
    }

    function buildKey(
        address to,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(to, a, b, c, input));
    }

    function unpackProof(Verifier.Proof memory proof)
        internal
        pure
        returns (
            uint256[2] memory,
            uint256[2][2] memory,
            uint256[2] memory
        )
    {
        uint256[2] memory a;
        a[0] = proof.a.X;
        a[1] = proof.a.Y;

        uint256[2][2] memory b;
        b[0] = proof.b.X;
        b[1] = proof.b.Y;

        uint256[2] memory c;
        c[0] = proof.c.X;
        c[1] = proof.c.Y;

        return (a, b, c);
    }

    function mintNFT(
        address to,
        uint256 tokenId,
        Verifier.Proof memory proof,
        uint256[2] memory input
    ) public {
        (
            uint256[2] memory a,
            uint256[2][2] memory b,
            uint256[2] memory c
        ) = unpackProof(proof);
        bytes32 key = buildKey(to, a, b, c, input);

        require(isUniqueSolution(key), "Already used solution");

        require(super.verifyTx(proof, input), "Invalid Solution params");
        _addSolution(key);
        super.mint(to, tokenId);
    }
}
