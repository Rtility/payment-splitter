//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@rari-capital/solmate/src/utils/ReentrancyGuard.sol";

contract PaymentSplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event Received(address, uint256);
    error PaymentFailed();
    error WrongShares();
    error WrongAddress();
    error NoBalance();

    address private _addr1;
    address private _addr2;

    uint256 private immutable _share1;
    uint256 private immutable _share2;

    constructor(
        address addr1_,
        address addr2_,
        uint256 share1_,
        uint256 share2_
    ) {
        if (addr1_ == address(0) || addr2_ == address(0)) revert WrongAddress();
        if (share1_ + share2_ != 100) revert WrongShares();
        if (share1_ == 0 || share2_ == 0) revert WrongShares();

        _addr1 = addr1_;
        _addr2 = addr2_;
        _share1 = share1_;
        _share2 = share2_;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        uint256 balance = address(this).balance;

        if (balance == 0) revert NoBalance();

        (bool success1, ) = _addr1.call{value: (balance * _share1) / 100}("");
        (bool success2, ) = _addr2.call{value: (balance * _share2) / 100}("");

        if (!success1 || !success2) revert PaymentFailed();
    }

    function withdraw(address erc20_) external nonReentrant {
        IERC20 erc20 = IERC20(erc20_);

        uint256 balance = erc20.balanceOf(address(this));

        erc20.safeTransfer(msg.sender, (balance * _share1) / 100);
        erc20.safeTransfer(msg.sender, (balance * _share2) / 100);
    }

    function changeAddr(address addr1_, address addr2_) external onlyOwner {
        
        if (addr1_ != address(0)) {
            _addr1 = addr1_;
        }

        if (addr2_ != address(0)) {
            _addr2 = addr2_;
        }
    }
}
