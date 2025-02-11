// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PLNTToken.sol";

contract GovernanceDAO {
    PLNTToken public token;
    Proposal[] public proposals;
    mapping(address => uint256) public shares;
    mapping(uint256 => mapping(address => bool)) public votes;
    mapping(address => address[]) public delegation;
    mapping(string => bool) private existingProposals;
    mapping(address => uint256) private proposalIndices;

    address public owner;
    uint256 public pricePerShare;
    bool public saleEnabled = true;
    uint256 public proposalCount;  // Variabile per tenere traccia del numero di proposte

    struct Proposal {
        address proposalAddr;
        string title;
        string description;
        bool executed;
        bool approved;
        uint256 voteCountPro;
        uint256 voteCountCon;
        uint256 voteCountAbstain;
        uint256 amount;
        address recipient;
    }

    event BuyOrder(address buyer, uint256 amount);
    event SaleState(bool enabled);
    event DelegationState(address to, bool addedRemoved);
    event ProposalState(string title, bool created, bool approved);
    event Vote(address member);

    constructor(address _tokenAddress, uint256 _pricePerShare) {
        token = PLNTToken(_tokenAddress);
        pricePerShare = _pricePerShare;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "This action is restricted to the owner only.");
        _;
    }

    modifier onlyMembers() {
        require(shares[msg.sender] > 0, "This action is restricted to the member only.");
        _;
    }

    function isMember() external view returns(bool) {
        return(shares[msg.sender] > 0);
    }

    function vote(uint256 proposalId, bool approve) public {
        require(shares[msg.sender] > 0, "You must own tokens to vote");
        Proposal storage proposal = proposals[proposalId];
        require(!votes[proposalId][msg.sender], "You have already voted on this proposal");

        if (approve) {
            proposal.voteCountPro++;
        } else {
            proposal.voteCountCon++;
        }

        votes[proposalId][msg.sender] = true;
        emit Vote(msg.sender);
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function isEmpty(string calldata s1) private pure returns(bool) {
        return keccak256(abi.encode(s1)) == keccak256(abi.encode(""));
    }

    function searchProposal(address proposalAddr) public view returns (uint256, Proposal memory) {
    uint256 index = proposalIndices[proposalAddr];
    require(index < proposals.length, "Proposal not found");
    return (index, proposals[index]);
}

    function setSaleState(bool _saleEnabled) external onlyOwner {
        if (saleEnabled == _saleEnabled) {
            revert("The sale state is already in the correct state");
        }
        saleEnabled = _saleEnabled;
        emit SaleState(saleEnabled);
    }

    function buyShares(uint256 amount) external {
        if (!saleEnabled) {
            revert("Sale is closed");
        }
        if (msg.sender == owner) {
            revert("Sender can't be the owner");
        }
        if (amount == 0) {
            revert("Amount must be greater than 0");
        }

        uint256 totalCost = amount * pricePerShare;
        bool success = token.transferFrom(msg.sender, address(this), totalCost);
        if (!success) {
            revert("Transfer failed");
        }

        shares[msg.sender] += amount;
        emit BuyOrder(msg.sender, amount);
    }

    function delegateMember(address member) external onlyMembers {
        require(shares[member] > 0, "Address not owned by a member");
        address[] storage delegators = delegation[member];
        bool alreadyDelegated = false;
        
        for (uint256 i = 0; i < delegators.length; i++) {
            if (delegators[i] == msg.sender) {
                alreadyDelegated = true;
                break;
            }
        }
        
        require(!alreadyDelegated, "Member is already your delegate");
        delegation[member].push(msg.sender);
        emit DelegationState(member, true);
    }

    function removeDelegation(address member) external onlyMembers {
        require(shares[member] > 0, "Address not owned by a member");
        address[] storage delegators = delegation[member];
        bool found = false;

        for (uint256 i = 0; i < delegators.length; i++) {
            if (delegators[i] == msg.sender) {
                found = true;
                delegators[i] = delegators[delegators.length - 1];
                delegators.pop();
                break;
            }
        }

        require(found, "Delegation not found");
        emit DelegationState(member, false);
    }

    function generateAddress(string memory value) private pure returns(address){
        return address(uint160(uint256(keccak256(abi.encodePacked(value)))));
    }

    function createProposal(
        string calldata title,
        string calldata description,
        address recipient,
        uint256 amount
    ) external onlyMembers returns(address) {
        if (isEmpty(title)) {
            revert("Empty title");
        }
        if (isEmpty(description)) {
            revert("Empty description");
        }
        if (recipient == address(0)) {
            revert("Target address cannot be zero");
        }

        proposalCount++;

        string memory proposalData = string.concat(title, description);

        existingProposals[proposalData] = true;

        address proposalAddr = generateAddress(proposalData);

        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].proposalAddr == proposalAddr) {
                revert("Proposal already exists");
            }
        }

        Proposal memory newProposal = Proposal({
            proposalAddr: proposalAddr,
            title: title,
            description: description,
            voteCountPro: 0,
            voteCountCon: 0,
            voteCountAbstain: 0,
            executed: false,
            approved: false,
            recipient: recipient,
            amount: amount
        });

        proposals.push(newProposal);
        emit ProposalState(title, true, false);

        return proposalAddr;
    }

    function voteProposal(address proposalAddr, bool support, bool abstain) external onlyMembers {
    address voter = msg.sender;
    uint256 totalDelegatedShares = shares[voter];

    (uint256 proposalId, ) = searchProposal(proposalAddr);

    // Verifica che non siano impostati entrambi i flag
    require(!(support && abstain), "Cannot support and abstain at the same time");

    
    if (votes[proposalId][voter]) {
        revert("Already voted");
    }

    Proposal storage proposal = proposals[proposalId];


    for (uint256 i = 0; i < delegation[voter].length; i++) {
    address delegate = delegation[voter][i];
    if (!votes[proposalId][delegate] && !votes[proposalId][voter]) {
        votes[proposalId][delegate] = true;
        totalDelegatedShares += shares[delegate]; 
    }
}
   
    if (abstain) {
        proposal.voteCountAbstain += totalDelegatedShares;
    } else if (support) {
        proposal.voteCountPro += totalDelegatedShares;
    } else {
        proposal.voteCountCon += totalDelegatedShares;
    }

  
    votes[proposalId][voter] = true;

    emit Vote(voter);
}


    function executeProposal(address proposalAddr) external onlyOwner {
        (uint256 proposalId, ) = searchProposal(proposalAddr);
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        uint256 totalVotes = proposal.voteCountPro + proposal.voteCountCon + proposal.voteCountAbstain;
        require(totalVotes > 0, "Not enough votes");

        proposal.executed = true;
        if (proposal.voteCountPro > proposal.voteCountCon) {
            proposal.approved = true;
            if (proposal.recipient != address(0) && proposal.amount > 0) {
                require(token.transfer(proposal.recipient, proposal.amount), "Token transfer failed");
            }
        }
        emit ProposalState(proposal.title, false, proposal.approved);
    }
}
