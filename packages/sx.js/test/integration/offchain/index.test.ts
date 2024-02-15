import { Wallet } from '@ethersproject/wallet';
import { EthereumSig } from '../../../src/clients/offchain/ethereum-sig';
import { offchainGoerli } from '../../../src/offchainNetworks';
import vote from './fixtures/vote.json';

// Test address: 0xf1f09AdC06aAB740AA16004D62Dbd89484d3Be90
const TEST_PK = 'ef4bcf36b5d026b703b86a311031fe2291b979620f01443f795fa213f9105e35';
const signer = new Wallet(TEST_PK);
const client = new EthereumSig({ networkConfig: offchainGoerli });

describe('vote', () => {
  it('should vote', async () => {
    const envelope = await client.vote({
      signer,
      // @ts-ignore
      data: vote
    });

    return expect(client.send(envelope)).resolves.toHaveProperty('id');
  });
});