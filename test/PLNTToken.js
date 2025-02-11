const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

describe("PLNT ERC20", function () {
    async function deployDAOFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const token = await hre.ethers.deployContract("PLNTToken", ["PLNTToken", "PLNT", ethers.parseEther("5000"), 1]);
        const dao = await hre.ethers.deployContract("GovernanceDAO", [token.target, ethers.parseEther("1")]);
        return { token, dao, owner, addr1, addr2 };
    }
    

    it("Should allow sender to buy PLNT Token", async function () {
        const { token, addr1 } = await loadFixture(deployDAOFixture);
    
        const purchaseAmount = ethers.parseEther("10");
        await token.connect(addr1).buyPLNT({ value: purchaseAmount });
    
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(purchaseAmount);
    });
    

    it("Should allow sender to approve PLNT", async function () {
        const { token, dao, addr1 } = await loadFixture(deployDAOFixture);
    
        const purchaseAmount = ethers.parseEther("10");
        const approvalAmount = purchaseAmount;
    
        await token.connect(addr1).buyPLNT({ value: purchaseAmount });
        await token.connect(addr1).approve(await dao.getAddress(), approvalAmount);
    
        const allowance = await token.allowance(addr1.address, await dao.getAddress());
        expect(allowance).to.equal(approvalAmount);
    });
    

    it("Should allow owner to change PLNT Token price", async function () {
        const { token, owner } = await loadFixture(deployDAOFixture);
    
        const newPrice = 5;
    
        
        await expect(token.connect(owner).updateTokenPrice(newPrice)).to.not.be.reverted;
    
        
        const updatedPrice = await token.tokenPrice();
        expect(updatedPrice).to.equal(newPrice);
    });

    it("Should not allow non-owner changing PLNT Token price", async function () {
        const { token, addr1 } = await loadFixture(deployDAOFixture);
    
        
        await expect(token.connect(addr1).updateTokenPrice(10)).to.be.revertedWith("Sender must be the owner");
    });
    

    
});

describe("PLNT ERC20", function () {
  
    async function deployDAOFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        
        
        const token = await hre.ethers.deployContract("PLNTToken", ["PLNT Token", "PLNT", ethers.parseEther("5000"), 1]);
        
        
        const dao = await hre.ethers.deployContract("GovernanceDAO", [token.target, ethers.parseEther("1")]);
        
        return { token, dao, owner, addr1, addr2 };
    }
    
  
    describe("PLNTToken Sale Activation", function () {
      let token, owner;
  
      beforeEach(async function () {
        
        ({ token, owner } = await deployDAOFixture());
      });
  
      it("should start with sale inactive", async function () {
        expect(await token.saleActive()).to.be.false;
      });
  
      it("should activate and deactivate sale", async function () {
        await token.setSaleActive(true);
        expect(await token.saleActive()).to.be.true;
  
        await token.setSaleActive(false);
        expect(await token.saleActive()).to.be.false;
      });
    });
  });

describe("Event Token PLNT", function () {
    async function deployDAOFixture() {
        const [owner, addr1] = await ethers.getSigners();
        const token = await hre.ethers.deployContract("PLNTToken", ["PLNTToken", "PLNT", ethers.parseEther("1000"), 1]);
        const dao = await hre.ethers.deployContract("GovernanceDAO", [token.getAddress(), ethers.parseEther("1")]);
        return { token, dao, owner, addr1 };
    }

    it("Should launch Transfer Event", async function () {
        const { token, addr1 } = await loadFixture(deployDAOFixture);

        await expect(
            token.connect(addr1).buyPLNT({ value: ethers.parseEther("10") })
        ).to.emit(token, "Transfer");
    });

    it("Correctly emit Approval event", async function () {
        const { token, dao, addr1 } = await loadFixture(deployDAOFixture);

        await token.connect(addr1).buyPLNT({ value: ethers.parseEther("10") });
        await expect(
            token.connect(addr1).approve(dao.getAddress(), ethers.parseEther("10"))
        ).to.emit(token, "Approval");
    });

    it("Token price is updated", async function () {
        const { token, owner } = await loadFixture(deployDAOFixture);
    
        const newPrice = 2;
    
        await expect(
            token.connect(owner).updateTokenPrice(newPrice)
        ).to.emit(token, "UpdatePrice").withArgs(newPrice);
    });
    
});
