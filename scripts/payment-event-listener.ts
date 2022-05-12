import { ethers } from 'hardhat';
import hre from 'hardhat';

async function main() {
  // get signer wallet
  const signer = (await ethers.getSigners())[0];

  //get contract instance from address
  const PaymentSplitter = await ethers.getContractAt(
    'PaymentSplitter',
    process.env.PAYMENT_SPLITTER_ADDRESS ?? '',
    signer
  );

  const withdraw = async () => {
    const contractBalance = await ethers.provider.getBalance(PaymentSplitter.address);

    if (contractBalance.gt(0)) {
      console.log('Withdrawing...');
      const tx1 = await PaymentSplitter.withdraw({
        maxFeePerGas: ethers.utils.parseUnits('60', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
      });
      await tx1.wait();
      console.log('Withdraw ' + ethers.utils.formatEther(contractBalance) + ' ETH at tx:', tx1.hash);
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
