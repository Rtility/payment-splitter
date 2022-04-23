//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@rari-capital/solmate/src/utils/ReentrancyGuard.sol";

/// @title A Gas Efficient 2 Wallets Payment Splitter
/// @author Rtility (https://github.com/Rtility/)
contract PaymentSplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event Received(address, uint256);
    event Withdraw(address, uint256);
    event WithdrawERC20(address, uint256);

    error PaymentFailed();
    error WrongShares();
    error WrongAddress();
    error NoBalance();

    address public addr1;
    address public addr2;

    uint256 public immutable share1;
    uint256 public immutable share2;

    /**
     * @dev Initializes the contract by setting addresses and shares.
     * @dev shares must be based on percentage (0-100)
     *
     * Requires:
     * - `addr1_` and `addr2_` not be zero address
     * - `share1_` and `share2_` must be greater than zero
     * - `share1_` + `share2_` must be 100
     *
     * @param addr1_ The address of the first wallet.
     * @param addr2_ The address of the second wallet.
     * @param share1_ The share of the first wallet.
     * @param share2_ The share of the second wallet.
     */
    constructor(
        address addr1_,
        address addr2_,
        uint256 share1_,
        uint256 share2_
    ) {
        if (addr1_ == address(0) || addr2_ == address(0)) revert WrongAddress();
        if (share1_ + share2_ != 100) revert WrongShares();
        if (share1_ == 0 || share2_ == 0) revert WrongShares();

        addr1 = addr1_;
        addr2 = addr2_;
        share1 = share1_;
        share2 = share2_;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 balance = address(this).balance;

        if (balance == 0) revert NoBalance();

        uint256 addr1Amount = (balance * share1) / 100;
        uint256 addr2Amount = (balance * share2) / 100;

        (bool success1, ) = addr1.call{value: addr1Amount}("");
        (bool success2, ) = addr2.call{value: addr2Amount}("");

        if (!success1 || !success2) revert PaymentFailed();

        emit Withdraw(addr1, addr1Amount);
        emit Withdraw(addr2, addr2Amount);
    }

    function withdrawERC20(address erc20_) external nonReentrant {
        IERC20 erc20 = IERC20(erc20_);

        uint256 balance = erc20.balanceOf(address(this));
        if (balance == 0) revert NoBalance();

        uint256 addr1Amount = (balance * share1) / 100;
        uint256 addr2Amount = (balance * share2) / 100;

        erc20.safeTransfer(addr1, addr1Amount);
        erc20.safeTransfer(addr2, addr2Amount);

        emit WithdrawERC20(addr1, addr1Amount);
        emit WithdrawERC20(addr2, addr2Amount);
    }

    function changeAddr(address addr1_, address addr2_) external onlyOwner {
        if (addr1_ != address(0)) {
            addr1 = addr1_;
        }

        if (addr2_ != address(0)) {
            addr2 = addr2_;
        }
    }
}
