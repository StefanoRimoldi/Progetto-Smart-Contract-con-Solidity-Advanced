require("@nomicfoundation/hardhat-toolbox");

const INFURA_API_KEY = "bb65298af67c444d982f6c2ff4f28085";
const PRIVATE_KEY_1 = "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY_1],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test", 
    cache: "./cache",
    artifacts: "./artifacts", 
  },
  mocha: {
    timeout: 40000,
  },
};
