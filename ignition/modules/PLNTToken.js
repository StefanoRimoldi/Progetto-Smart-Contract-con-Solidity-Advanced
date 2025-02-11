const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const NAME = "PLNTToken";
const SYMBOL = "PLNT";
const INITIAL_SUPPLY = 5000;
const TOKEN_PRICE = 1;

const ERC20Module = buildModule("ERC20Module", (m) => {
  const name = m.getParameter("name", NAME);
  const symbol = m.getParameter("symbol", SYMBOL);
  const initialSupply = m.getParameter("initialSupply", INITIAL_SUPPLY);
  const tokenPrice = m.getParameter("tokenPrice", TOKEN_PRICE);

  const PLNTToken = m.contract("PLNTToken", [name, symbol, initialSupply, tokenPrice]);

  return { PLNTToken };
});

module.exports = ERC20Module;
