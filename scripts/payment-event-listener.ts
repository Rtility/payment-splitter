import { ethers } from 'hardhat';
import hre from 'hardhat';
import { BigNumber } from 'ethers';

async function main() {
  // get signer wallet
  const signer = (await ethers.getSigners())[0];

  //get contract instance from address
  const PaymentSplitter = await ethers.getContractAt(
    'PaymentSplitter',
    process.env.PAYMENT_SPLITTER_ADDRESS ?? '',
    signer
  );
  const MAX_GAS_PRICE = BigNumber.from(process.env.MAX_GAS_PRICE) ?? BigNumber.from('60000000000'); // defaults to 60 gwei

  const withdraw = async () => {
    const contractBalance = await ethers.provider.getBalance(PaymentSplitter.address);

    if (contractBalance.gt(0)) {
      console.log('Contract has funds of ' + ethers.utils.formatEther(contractBalance) + ' ETH ');

      // do {
      //   console.log('Checking gas price...');

      //   const maxFeePerGas = BigNumber.from((await signer.getFeeData()).maxFeePerGas);

      //   console.log(`maxFeePerGas is: ${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} gwei`);
      //   if (maxFeePerGas.gt(MAX_GAS_PRICE)) {
      //     console.log('Gas price is too high, try again in 30 minutes...');
      //     await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));
      //   } else {
      //     break;
      //   }
      // } while (true);

      // console.log('Gas price is good, withdrawing...');
      console.log('Withdrawing...');
      const tx = await PaymentSplitter.withdraw();
      console.log(tx.blockNumber);
      await tx.wait();
      console.log('Withdrawal of ' + ethers.utils.formatEther(contractBalance) + ' ETH completed at tx:', tx.hash);
    } else {
      console.log('No balance to withdraw, contract balance is already withdrawn!');
    }
  };

  console.log('> First check contract balance and withdraw if any.');
  await withdraw();

  // listen on Received event
  console.log('> Listening to events on ' + PaymentSplitter.address + ' on network ' + hre.network.name + '...');
  PaymentSplitter.on('Received', async (from: string, amount: string) => {
    console.log(`Received ${ethers.utils.formatEther(amount)} ETH from ${from}`);
    await withdraw();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
