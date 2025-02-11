const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

function generateProposalAddress(value) {
    
    const hash = ethers.keccak256(ethers.toUtf8Bytes(value));

    
    const trimmedHash = hash.substring(hash.length - 40);
    const address = ethers.getAddress('0x' + trimmedHash);

    return address;
}

describe("Governance DAO", function () {

    async function deployDAOFixture() {
        
        const [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    
        
        const initialSupply = ethers.parseEther("5000");
        const token = await hre.ethers.deployContract("PLNTToken", ["PLNTToken", "PLNT", initialSupply, 1]);
    
        
        const minContribution = ethers.parseEther("1");
        const dao = await hre.ethers.deployContract("GovernanceDAO", [token.getAddress(), minContribution]);
    
        
        const purchaseAmount = ethers.parseEther("10");
        await token.connect(addr1).buyPLNT({ value: purchaseAmount });
        await token.connect(addr2).buyPLNT({ value: purchaseAmount });
    
        
        const title = "Test Proposal";
        const description = "This is a test proposal";
        
        return { dao, token, owner, addrs, addr1, addr2, addr3, title, description };
    }

    it("should not allow voting without tokens", async function () {
        const { dao, addr2 } = await loadFixture(deployDAOFixture);

        await expect(
            dao.connect(addr2).vote(0, true)
        ).to.be.revertedWith("You must own tokens to vote");
    });
    

    it("Users should be able to buy shares.", async function () {
        const { dao, token, addr1 } = await loadFixture(deployDAOFixture);
    
        
        const initialBalance = ethers.parseEther("10");
        expect(await token.balanceOf(addr1)).to.equal(initialBalance);
    
        
        await token.connect(addr1).approve(dao.getAddress(), initialBalance);
    
        
        const sharesToBuy = 10;
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        
        expect(await dao.shares(addr1.address)).to.equal(sharesToBuy);
    });
    

    it("Members should be able to create proposals.", async function () {
        const { dao, token, addr1, title, description } = await loadFixture(deployDAOFixture);
    
        
        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        
        const targetAddress = addr1.address;
        const value = ethers.parseEther("0");
        await dao.connect(addr1).createProposal(title, description, targetAddress, value);
    
        
        const proposalAddr = generateProposalAddress(title + description);
        const proposals = await dao.getProposals();
    
        expect(proposals).to.have.lengthOf(1);
        expect(proposals[0].proposalAddr).to.equal(proposalAddr);
        expect(proposals[0].title).to.equal(title);
    });

    it("Should revert if the proposal title is empty", async function () {
        const { dao, token, addr1 } = await loadFixture(deployDAOFixture);
    
        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        const description = "Valid description";
        const targetAddress = ethers.getAddress("0x0000000000000000000000000000000000000000");
        const value = ethers.parseEther("0");
    
        await expect(
            dao.connect(addr1).createProposal("", description, targetAddress, value)
        ).to.be.revertedWith("Empty title");
    });

    it("Should revert if the target address is the zero address", async function () {
        const { dao, token, addr1, title, description } = await loadFixture(deployDAOFixture);
    
        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        const targetAddress = ethers.ZeroAddress;
        const value = ethers.parseEther("0");
    
        await expect(
            dao.connect(addr1).createProposal(title, description, targetAddress, value)
        ).to.be.revertedWith("Target address cannot be zero");
    });
 

    it("Members should be able to create proposals with a transfer option.", async function () {
        const { dao, token, addr1, addr2, title, description } = await loadFixture(deployDAOFixture);
    
        
        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        
        const transferAmount = ethers.parseEther("1");
        await dao.connect(addr1).createProposal(title, description, addr2.address, transferAmount);
    
        
        const proposalAddr = generateProposalAddress(title + description);
        const proposals = await dao.getProposals();
    
        
        expect(proposals).to.have.lengthOf(1); 
        expect(proposals[0].proposalAddr).to.equal(proposalAddr); 
        expect(proposals[0].recipient).to.equal(addr2.address);
        expect(proposals[0].amount).to.equal(transferAmount);
    });

    it("should fail if the description is empty", async function () {
        const { dao, token, addr1, title } = await loadFixture(deployDAOFixture);
    
        
        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
    
        const targetAddress = addr1.address;
        const value = ethers.parseEther("0");
    
        
        await expect(
            dao.connect(addr1).createProposal(title, "", targetAddress, value)
        ).to.be.revertedWith("Empty description");
    });
    
    

    it("Members should not be able to vote twice on the same proposal.", async function () {
        const { dao, token, addr1, addr2, title, description } = await loadFixture(deployDAOFixture);
    
        const sharesToBuy = ethers.parseEther("10");
        await token.connect(addr1).approve(dao.getAddress(), sharesToBuy);
        await dao.connect(addr1).buyShares(10);
    
        const transferAmount = ethers.parseEther("1");
        await dao.connect(addr1).createProposal(title, description, addr2.address, transferAmount);
        const proposalAddr = generateProposalAddress(title + description);
    
        
        let proposals = await dao.getProposals();
        expect(proposals).to.have.lengthOf(1);
        expect(proposals[0].proposalAddr).to.equal(proposalAddr);
    
        await dao.connect(addr1).voteProposal(proposalAddr, true, false);
    
        // Tentativo di doppio voto, dovrebbe essere revert
        await expect(dao.connect(addr1).voteProposal(proposalAddr, true, false))
            .to.be.revertedWith("Already voted");
    
        proposals = await dao.getProposals();
        expect(proposals[0].voteCountPro).to.equal(10);
    });

    it("Should not allow creating the same proposal twice", async function () {
        const { dao, token, addr1, title, description } = await loadFixture(deployDAOFixture);
    
        const addr1Shares = ethers.parseEther("10");
        await token.connect(addr1).approve(dao.getAddress(), addr1Shares);
        await dao.connect(addr1).buyShares(10);
    
        const proposalAmount = ethers.parseEther("1");
    
        // Prima creazione della proposta
        await dao.connect(addr1).createProposal(
            title,
            description,
            addr1.address,
            proposalAmount
        );
    
        // Tentativo di duplicazione
        await expect(
            dao.connect(addr1).createProposal(
                title,
                description,
                addr1.address,
                proposalAmount
            )
        ).to.be.revertedWith("Proposal already exists");
    });

    it("should allow multiple proposals with different content", async function () {
        const { dao, token, addr1, title, description } = await loadFixture(deployDAOFixture);
        

        const sharesToBuy = 10;
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(sharesToBuy);
        
        
        const targetAddress1 = addr1.address;
        const value1 = ethers.parseEther("0");
        const title1 = "Proposal 1";
        const description1 = "Description of proposal 1";
        await dao.connect(addr1).createProposal(title1, description1, targetAddress1, value1);
        
        
        const targetAddress2 = addr1.address;
        const value2 = ethers.parseEther("0");
        const title2 = "Proposal 2";
        const description2 = "Description of proposal 2";
        await dao.connect(addr1).createProposal(title2, description2, targetAddress2, value2);
    
        
        const proposals = await dao.getProposals();
        
        
        expect(proposals).to.have.lengthOf(2);
    
        
        expect(proposals[0].title).to.equal(title1);
        expect(proposals[0].description).to.equal(description1);
        expect(proposals[1].title).to.equal(title2);
        expect(proposals[1].description).to.equal(description2);
    });
    
    

    
    //PRO_CONTRO_ASTENUTO

    it("Members should be able to vote in favor, against, or abstain on proposals.", async function () {
        const { dao, token, addr1, addr2, addr3, title, description } = await loadFixture(deployDAOFixture);
    
        
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(10);
    
        await token.connect(addr2).approve(dao.getAddress(), ethers.parseEther("5"));
        await dao.connect(addr2).buyShares(5);
    
        await token.connect(addr3).buyPLNT({ value: ethers.parseEther("3") });
        await token.connect(addr3).approve(dao.getAddress(), ethers.parseEther("3"));
        await dao.connect(addr3).buyShares(3);
    
        
        await dao.connect(addr1).createProposal(title, description, addr2.address, ethers.parseEther("1"));
        const proposalAddr = generateProposalAddress(title + description);
    
        const proposals = await dao.getProposals();
        expect(proposalAddr).to.equal(proposals[0].proposalAddr);
    
        
        await dao.connect(addr1).voteProposal(proposalAddr, true, false);  
        await dao.connect(addr2).voteProposal(proposalAddr, false, false); 
        await dao.connect(addr3).voteProposal(proposalAddr, false, true); 
    
        const updatedProposals = await dao.getProposals();
        expect(updatedProposals[0].voteCountPro).to.equal(10);
        expect(updatedProposals[0].voteCountCon).to.equal(5);
        expect(updatedProposals[0].voteCountAbstain).to.equal(3);
    
        await dao.executeProposal(proposalAddr);
    
        const finalProposals = await dao.getProposals();
        expect(finalProposals[0].executed).to.be.true;
        expect(finalProposals[0].approved).to.be.true;
    });
    

    it("Should allow vote delegation and execute proposal with transfer", async function () {
        const { dao, token, addr1, addr2, title, description } = await loadFixture(deployDAOFixture);
    

        const addr1Shares = ethers.parseEther("10");
        const addr2Shares = ethers.parseEther("5");
        await token.connect(addr1).approve(dao.getAddress(), addr1Shares);
        await dao.connect(addr1).buyShares(10);
        await token.connect(addr2).approve(dao.getAddress(), addr2Shares);
        await dao.connect(addr2).buyShares(5);
    

        expect(await dao.shares(addr1.address)).to.equal(10);
        expect(await dao.shares(addr2.address)).to.equal(5);
    
        
        await dao.connect(addr2).delegateMember(addr1.address);
    

        const transferAmount = ethers.parseEther("1");
        await dao.connect(addr1).createProposal(title, description, addr2.address, transferAmount);
        const proposalAddr = generateProposalAddress(title + description);
    

        let proposals = await dao.getProposals();
        expect(proposals).to.have.lengthOf(1);
        expect(proposals[0].proposalAddr).to.equal(proposalAddr);
    

        await dao.connect(addr1).voteProposal(proposalAddr, true, false);
    

        proposals = await dao.getProposals();
        expect(proposals[0].voteCountPro).to.equal(15);
    

        await dao.executeProposal(proposalAddr);
    

        proposals = await dao.getProposals();
        expect(proposals[0].executed).to.be.true;
        expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("6"));
    });

    it("should fail gracefully if a non-owner tries to execute the proposal", async function () {
        const { dao, token, addr1, title, description, owner } = await loadFixture(deployDAOFixture);
    
        
        await token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"));
        await dao.connect(addr1).buyShares(10);
    
        const transferAmount = ethers.parseEther("1");
        await dao.connect(addr1).createProposal(title, description, addr1.address, transferAmount);
        const proposalAddr = generateProposalAddress(title + description);
    
        
        await expect(
            dao.connect(addr1).executeProposal(proposalAddr)
        ).to.be.revertedWith("This action is restricted to the owner only.");
    });
   
});