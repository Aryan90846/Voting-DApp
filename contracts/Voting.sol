// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    bool public votingEnded = false;
    string public winner;

    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;

    constructor() {
        admin = msg.sender;
        candidates.push(Candidate("Aryan", 0));
        candidates.push(Candidate("Priya", 0));
        candidates.push(Candidate("Ravi", 0));
        candidates.push(Candidate("Neha", 0));
    }

    function vote(uint candidateIndex) public {
        require(!hasVoted[msg.sender], "Already voted.");
        require(!votingEnded, "Voting has ended.");
        require(candidateIndex < candidates.length, "Invalid candidate.");

        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function endVoting() public {
        require(msg.sender == admin, "Only admin can end voting.");
        votingEnded = true;

        uint maxVotes = 0;
        uint winnerIndex = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        winner = candidates[winnerIndex].name;
    }

    function getWinner() public view returns (string memory) {
        require(votingEnded, "Voting not yet ended.");
        return winner;
    }

    function totalCandidates() public view returns (uint) {
        return candidates.length;
    }

    function getVoteCount(uint index) public view returns (uint) {
        return candidates[index].voteCount;
    }

    function getCandidateName(uint index) public view returns (string memory) {
        return candidates[index].name;
    }
}
