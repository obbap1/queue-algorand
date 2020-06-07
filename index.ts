import * as algosdk from 'algosdk';
import * as dotenv from 'dotenv';
import { PerformanceObserver, performance } from 'perf_hooks';

dotenv.config();

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });

/****** CREDENTIALS *******/

const {
  FIRST_ACCOUNT,
  FIRST_PASS_PHRASE,
  SECOND_ACCOUNT,
  SECOND_PASS_PHRASE,
  RECEIVER,
} = process.env;

let client: any = null;
async function setupClient(): Promise<any> {
  if (client === null) {
    const baseServer = 'https://testnet-algorand.api.purestake.io/ps1';
    const port = '';
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = {
      'X-API-Key': 'gOO1rFOHJA9iHPCwjSgTC8h6qKwLGUBc6AcTO5pH',
    };
    client = new (algosdk.Algod as any)(token, baseServer, port, headers);
  }

  return client;
}

// function generateAlgorandKeyPair(): string {
//   const account = algosdk.generateAccount();
//   console.log({
//     ...account,
//     mnemonic: algosdk.secretKeyToMnemonic(account.sk),
//   });
//   return algosdk.secretKeyToMnemonic(account.sk);
// }

function recoverAccount(passphrase: string): any {
  return algosdk.mnemonicToSecretKey(passphrase);
}

const waitForConfirmation = async function (
  algodclient: any,
  txId: string
): Promise<void> {
  while (true) {
    let { lastRound } = await algodclient.status();
    let pendingInfo = await algodclient.pendingTransactionInformation(txId);
    if (pendingInfo.round != null && pendingInfo.round > 0) {
      console.log(
        `Transaction ${pendingInfo.tx} confirmed in round ${pendingInfo.round}`
      );

      break;
    }

    await algodclient.statusAfterBlock(lastRound + 1);
  }
};

async function submitGroupTransactions(): Promise<void> {
  try {
    let algodclient = await setupClient();
    const [firstAccount, secondAccount] = await Promise.all([
      recoverAccount(FIRST_PASS_PHRASE),
      recoverAccount(SECOND_PASS_PHRASE),
    ]);

    const params = await algodclient.getTransactionParams();

    const [firstTransaction, secondTransaction] = await Promise.all([
      algosdk.makePaymentTxn(
        FIRST_ACCOUNT,
        RECEIVER,
        params.minFee,
        10000,
        undefined,
        params.lastRound,
        params.lastRound + 1000,
        new Uint8Array(0),
        params.genesishashb64,
        params.genesisID
      ),
      algosdk.makePaymentTxn(
        SECOND_ACCOUNT,
        firstAccount.addr,
        params.minFee,
        10000,
        undefined,
        params.lastRound,
        params.lastRound + 1000,
        new Uint8Array(0),
        params.genesishashb64,
        params.genesisID
      ),
    ]);

    const txns = [firstTransaction, secondTransaction];

    const txgroup = algosdk.assignGroupID(txns, '');

    const signed = [
      firstTransaction.signTxn(firstAccount.sk),
      secondTransaction.signTxn(secondAccount.sk),
    ];

    const tx = await algodclient.sendRawTransactions(signed);

    await waitForConfirmation(algodclient, tx.txId);
  } catch (error) {
    console.log(`Error ${JSON.stringify(error)}`);
  }
}

performance.mark('A');

submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();
submitGroupTransactions();

performance.mark('B');
performance.measure('A to B', 'A', 'B');
