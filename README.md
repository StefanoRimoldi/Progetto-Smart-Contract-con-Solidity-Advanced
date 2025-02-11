# Progetto Smart Contract con Solidity Advanced - Planty of Food
<a name="readme-top"></a>

## Introduzione

Il progetto **Planty of Food** è una DAO progettata per promuovere la partecipazione diretta dei sostenitori dell'azienda nel settore della produzione biologica alimentare. È composto da due contratti: un contratto **ERC20** che funge da token di governance, consentendo ai partecipanti di fare proposte e votare, e un contratto dedicato alla gestione dei membri, alla creazione e votazione delle proposte, all'assegnazione di deleghe e all'esecuzione delle decisioni approvate.

## Sommario

- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Struttura del progetto](#struttura-del-progetto)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Funzionalità](#funzionalità)
- [Interazione con i contratti](#interazione-con-i-contratti)
- [Link Progetto](#link-progetto)
- [Contatti](#contatti)

---

## Prerequisiti

Prima di eseguire l'applicazione, assicurati di avere installati i seguenti strumenti:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Metamask](https://metamask.io/) per interagire con la rete Ethereum o una rete di test Sepolia.

Puoi verificare se hai già questi strumenti con i seguenti comandi:

```bash
node -v
npm -v
```

## Installazione

Segui questi passaggi per configurare e avviare il progetto **Planty of Food** nel tuo ambiente locale:

1. **Clona il repository**  
   Utilizza Git per clonare il repository del progetto:  
   ```bash
   git clone https://github.com/tuo-username/planty-of-food.git
   cd planty-of-food
   ```

2. **Installa le dipendenze**  
   Assicurati di avere `npm` installato, quindi esegui:  
   ```bash
   npm install
   ```

3. **Configura l'ambiente**    
   - Inserisci la tua private key e API Key di Infuria nel hardhat.config.js:
     ```plaintext
     PRIVATE_KEY=<la tua chiave privata>
     INFURA_API_KEY=<il tuo Infura API Key>
     ```
   - Sostituisci `<la tua chiave privata>` e `<il tuo Infura API Key>` con i valori corretti.

4. **Compila i contratti**  
   Compila gli smart contract con Hardhat:  
   ```bash
   npx hardhat compile
   ```

5. **Esegui i test (opzionale)**  
   Per assicurarti che tutto funzioni correttamente, esegui i test:  
   ```bash
   npx hardhat test
   ```

6. **Avvia la rete locale**  
   Esegui Hardhat Network per testare il contratto localmente:  
   ```bash
   npx hardhat node
   ```

7. **Esegui il Deployment**

   Esegui il deployment dei contratti seguendo questi passaggi:

   1. **Deploy del contratto Token ERC20**:  
      Prima di eseguire il deploy del contratto **GovernanceDAO**, è necessario distribuire il contratto token ERC20 (ad esempio, il token della governance). Esegui il deploy del contratto ERC20 con il comando:

      ```bash
      npx hardhat ignition deploy ./ignition/modules/\PLNTToken.js --network sepolia
      ```

      Sostituisci `<network_name>` con il nome della rete configurata (`localhost`, `sepolia`, ecc.).

   2. **Ottieni l'indirizzo del contratto ERC20**:  
      Una volta completato il deploy del contratto ERC20, copia l'indirizzo del contratto che viene restituito nel terminale. Questo indirizzo sarà utilizzato nel passo successivo per configurare il contratto **GovernanceDAO**.

   3. **Deploy del contratto GovernanceDAO**:  
      Ora che hai l'indirizzo del contratto ERC20, è possibile eseguire il deploy del contratto **GovernanceDAO**. Assicurati di inserire l'indirizzo del contratto ERC20 appena ottenuto nel file del contratto **GovernanceDAO**. Poi esegui il deploy con il comando:

      ```bash
      npx hardhat ignition deploy ./ignition/modules/\<NomeContratto>.js --network sepolia
      ```

      In questo modo, il contratto **GovernanceDAO** sarà correttamente configurato per interagire con il contratto token ERC20 distribuito in precedenza.


Ora il progetto è configurato e pronto per essere utilizzato!

### Struttura del progetto

Ogni cartella ha uno scopo specifico:
- **`contracts/`**: Contiene gli smart contract Solidity statici, accessibili direttamente per interazioni con la blockchain.
- **`ignition/`**: Contiene le istruzioni di deploy per l'ambiente hardhat.
  - **`tests/`**: Contiene i test per i due contratti GovernanceDao ed PLNTToken.
  - **`hardhat.config.js/`**: File di configurazione di Hardhat che contiene informazioni di rete e dati statici, come le API key e le configurazioni dei contratti.
  - **`package.json/`**: Contiene le dipendenze del progetto.


## Tecnologie Utilizzate

- **Hardhat**: Framework di sviluppo per Ethereum che permette di compilare, testare e distribuire smart contract in modo facile e veloce. Utilizzato per la gestione e il deployment degli smart contract.
- **Solidity**: Linguaggio di programmazione per la scrittura degli smart contract su blockchain Ethereum.
- **Ethereum**: Blockchain utilizzata per l'esecuzione degli smart contract e per la gestione delle transazioni decentralizzate.
- **Ether.js**: Libreria JavaScript per interagire con la blockchain Ethereum. Utilizzata per gestire transazioni, smart contract e wallet in modo sicuro e semplice.


## Funzionalità

- **Partecipazione alla Governance**: gli utenti possono acquistare quote, partecipare alla governance e proporre/votare proposte tramite il token ERC20.
- **Creazione e Votazione di Proposte**: gli utenti possono creare nuove proposte di governance e votare su di esse, con possibilità di delegare il voto ad altri membri.
- **Gestione delle Azioni**: i membri possono acquistare azioni della DAO.
- **Integrazione con Smart Contract**: interazione diretta con smart contract tramite Ether.js per il processo di votazione, acquisto delle azioni e esecuzione delle proposte.
- **Gestione dei Voti e Deleghe**: gli utenti possono delegare i propri voti ad altri membri della DAO e rimuovere la delega quando necessario.
- **Esecuzione delle Proposte**: una volta approvata una proposta, l'esecuzione viene gestita tramite smart contract per l'esecuzione delle azioni approvate (ad esempio, trasferimento di fondi).
- **Visualizzazione delle Proposte**: gli utenti possono visualizzare tutte le proposte in corso, inclusi i dettagli, i voti e lo stato di approvazione.
- **Gestione del Wallet**: gli utenti possono connettere e disconnettere il proprio wallet Ethereum tramite MetaMask per interagire con la DAO e le proposte.

## Interazione con i contratti

Il progetto include una cartella **scripts** che contiene file dedicati all'interazione con gli smart contract. Questi script permettono di testare e utilizzare le funzionalità principali del contratto in un ambiente locale.

### Esecuzione dello Script

Per avviare l'ambiente di test e interagire con i contratti, segui questi passaggi:

1. Avvia una rete locale di test utilizzando Hardhat:

   ```bash
   npx hardhat node
   ```

2. Esegui lo script di interazione con il seguente comando:

   ```bash
   npx hardhat run scripts/BuyTokens.js --network localhost
   ```

### Funzionalità Principali

Lo script BuyTokens.js è progettato per:

- **Acquistare token utilizzando account di test.**
- **Creare proposte all'interno del contratto.**

Questa configurazione consente di testare e simulare operazioni reali prima della distribuzione del contratto su una rete principale.









## Realizzato con:
- Visual Studio Code

## Link progetto:

- Repo GitHub: https://github.com/StefanoRimoldi/Progetto-Smart-Contract-con-Solidity-Advanced.git

## Contatti
- Email: rimoldistefano@gmail.com
- Linkedin: www.linkedin.com/in/stefano-rimoldi

<p align="right">(<a href="#readme-top">back to top</a>)</p>
