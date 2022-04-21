import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import {PaymentSplitter, PaymentSplitter__factory} from '../typechain';

import { deployContract } from './helpers';

describe('PaymentSplitter', () => {

  let splitter: PaymentSplitter;
  
  let owner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const ownerCoinCount = ethers.utils.parseEther('1000000');
  const ownerNFTCount = BigNumber.from(10);
  const prizePerSec = ethers.utils.parseEther('0.016');


  

  context('deploy', async () => {
    it('should deploy the contract', async () => {
      const contract = await deployContract('PaymentSplitter');
    });
  });
});
