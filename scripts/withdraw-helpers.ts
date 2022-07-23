import { ethers } from 'hardhat';
import { PaymentSplitter } from '../typechain';

const ETHWithdraw = async (PaymentSplitter: PaymentSplitter) => {
  //                ETH
  const contractBalance = await ethers.provider.getBalance(PaymentSplitter.address);

  if (contractBalance.gt(0)) {
    console.log('Withdrawing ETH ...');
    const tx1 = await PaymentSplitter.withdraw({
      maxFeePerGas: ethers.utils.parseUnits('60', 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
    });
    await tx1.wait();
    console.log('Withdraw ETH' + ethers.utils.formatEther(contractBalance) + ' ETH at tx:', tx1.hash);
  } else {
    console.log('No ETH balance to withdraw!');
  }
};

const WETHWithdraw = async (PaymentSplitter: PaymentSplitter) => {
  //               WETH
  // get WETH contract
  const WETH = await ethers.getContractAt('ERC20', process.env.WETH_ADDRESS ?? '');
  const WETHBalance = await WETH.balanceOf(PaymentSplitter.address);
  
  if (WETHBalance.gt(0)) {
    console.log('Withdrawing WETH...');
    const tx2 = await PaymentSplitter.withdrawERC20(WETH.address, {
      maxFeePerGas: ethers.utils.parseUnits('60', 'gwei'),
      maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
    });
    await tx2.wait();
    console.log('Withdraw ' + ethers.utils.formatEther(WETHBalance) + ' WETH at tx:', tx2.hash);
  } else {
    console.log('No WETH balance to withdraw!');
  }
};

const fullWithdraw = async (PaymentSplitter: PaymentSplitter) => {
  await ETHWithdraw(PaymentSplitter);
  await WETHWithdraw(PaymentSplitter);
};

export { fullWithdraw, ETHWithdraw, WETHWithdraw };
