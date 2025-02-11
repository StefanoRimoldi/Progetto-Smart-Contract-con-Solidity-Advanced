const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

async function main() {
  const accounts = await web3.eth.getAccounts();
  const buyer = accounts[0];
  const contractAddressPLNT = '0xceF57b9f7a0Fe6F52847C382cEB66f0fD03A9BFd';
  const contractAddressDAO = '0xd0f42AbAB1A133fDf8a0346e117F5cab3728ae2D'; // Inserisci l'indirizzo di GovernanceDAO

  // ABI per i contratti
  const contractABIPLNT = require('../artifacts/contracts/PLNTToken.sol/PLNTToken.json').abi;
  const contractABIDAO = require('../artifacts/contracts/GovernanceDAO.sol/GovernanceDAO.json').abi;

  // Contratti
  const PLNTContract = new web3.eth.Contract(contractABIPLNT, contractAddressPLNT);
  const DAOContract = new web3.eth.Contract(contractABIDAO, contractAddressDAO);

  console.log(`Compratore: ${buyer}`);

  // Saldo iniziale
  const balanceWei = await web3.eth.getBalance(buyer);
  console.log(`Saldo iniziale: ${web3.utils.fromWei(balanceWei, 'ether')} ETH`);

  // Acquisto token
  const ethToSend = web3.utils.toWei('0.01', 'ether');

  try {
    const tx = await PLNTContract.methods.buyPLNT().send({
      from: buyer,
      value: ethToSend,
    });
    console.log('Token acquistati con successo!', tx);
  } catch (error) {
    console.error("Errore durante l'acquisto dei token:", error);
  }

  // Creazione di una proposta
  const proposalTitle = "Proposta di Esempio";
  const proposalDescription = "Questa è una descrizione di esempio per una proposta.";
  const proposalRecipient = accounts[1]; // Modifica con l'indirizzo desiderato
  const proposalAmount = web3.utils.toWei('10', 'ether');

  try {
    const proposalTx = await DAOContract.methods
      .createProposal(proposalTitle, proposalDescription, proposalRecipient, proposalAmount)
      .send({ from: buyer });

    console.log('Proposta creata con successo!', proposalTx);
  } catch (error) {
    console.error('Errore durante la creazione della proposta:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
