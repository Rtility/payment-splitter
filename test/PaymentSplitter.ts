import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { PaymentSplitter } from '../typechain';

import { deployContract, tryDeploy, transferETH } from './helpers';

describe('PaymentSplitter', () => {
  let splitter: PaymentSplitter;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const share1: number = 70;
  const share2: number = 30;

  const ZERO_ADDRESS = ethers.constants.AddressZero;

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  context('deploy', async () => {
    it('should deploy with correct params', async () => {
      expect(await tryDeploy('PaymentSplitter', addr1.address, addr2.address, share1, share2)).to.be.ok;
    });

    context('address', () => {
      it('should revert with zero address', async () => {
        await expect(tryDeploy('PaymentSplitter', ZERO_ADDRESS, addr2.address, share1, share2)).to.revertedWith(
          'WrongAddress'
        );

        await expect(tryDeploy('PaymentSplitter', addr1.address, ZERO_ADDRESS, share1, share2)).to.revertedWith(
          'WrongAddress'
        );

        await expect(tryDeploy('PaymentSplitter', ZERO_ADDRESS, ZERO_ADDRESS, share1, share2)).to.revertedWith(
          'WrongAddress'
        );
      });
    });

    context('shares', () => {
      it('should revert with zero share', async () => {
        await expect(tryDeploy('PaymentSplitter', addr1.address, addr2.address, 0, 100)).to.revertedWith('WrongShare');

        await expect(tryDeploy('PaymentSplitter', addr1.address, addr2.address, 100, 0)).to.revertedWith('WrongShare');

        await expect(tryDeploy('PaymentSplitter', addr1.address, addr2.address, 0, 0)).to.revertedWith('WrongShare');
      });

      it('should revert when shares sum are not 100', async () => {
        await expect(tryDeploy('PaymentSplitter', addr1.address, addr2.address, 10, 20)).to.revertedWith('WrongShare');
      });
    });
  });

  context('after deploy', async () => {
    beforeEach(async () => {
      // deploy contracts
      splitter = await deployContract('PaymentSplitter', addr1.address, addr2.address, share1, share2);
    });

    context('recieve', async () => {
      it('should recieve eth', async () => {
        const amount = ethers.utils.parseEther('1');

        const tx = await transferETH(splitter, amount, owner);

        // expect to emit Received
        await expect(tx).to.emit(splitter, 'Received').withArgs(owner.address, amount);

        // get balance of contract
        const contractBalance = await ethers.provider.getBalance(splitter.address);

        expect(contractBalance).to.eq(amount);
      });
    });
  });
});
