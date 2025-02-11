const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ERC20_ADDRESS = "0xceF57b9f7a0Fe6F52847C382cEB66f0fD03A9BFd";
const PRICE_PER_SHARE = 1;

const DAOModule = buildModule("DAOModule", (m) => {
  const address = m.getParameter("_tokenAddress", ERC20_ADDRESS);
  const price = m.getParameter("_pricePerShare", PRICE_PER_SHARE);

  const GovernanceDAO = m.contract("GovernanceDAO", [address, price]);

  return { GovernanceDAO };
});

module.exports = DAOModule;

