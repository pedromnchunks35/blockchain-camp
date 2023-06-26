const { expect } = require("chai");
const { ethers } = require("hardhat");
let token;
let accounts;
/* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
CONSIDERING THE DECIMALS */
const realVal = (_number_of_tokens) => {
  return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');
}
//FUNCTION TO RUN BEFORE RUNNING THE TESTS
beforeEach(async () => {
  const Token = await ethers.getContractFactory('Token');
  token = await Token.deploy('Dapp University', "DAPP", 1000000);
  accounts = await ethers.getSigners();
});
// CONTAINER FOR TESTINGS
describe('Token', () => {
  //MAKING ALL THE TESTS OUT
  //CHECK THE NAME
  it('Has correct Name', async () => {
    //READ TOKEN NAME
    return token.name()
      .then((name) => {
        //CHECK IF THE NAME MATCHES
        expect(name).to.equal("Dapp University");
      });
  });
  //CHECK SYMBOL
  it("Has correct Symbol", () => {
    return token.symbol()
      .then((symbol) => {
        expect(symbol).to.equal("DAPP");
      });
  });
  //CHECK TOTAL SUPPLY
  it("Has the correct total Supply", () => {
    return token.totalSupply()
      .then(ts => {
        /* SINCE OUR DECIMALS ARE 18, 
        WHAT HAPPENS IS THAT WHEN WE PASS THE VALUE TO WEI SAYING THAT 
        IT REPRESENTS ETHER , IT WILL CONVERT CORRECTLY THE VALUE */
        const value = ethers.utils.parseUnits('1000000', 'ether');
        expect(ts).to.equal(value);
      });
  });
  it("The deployer of the contract has all the supply", () => {
    return token.balanceOf(accounts[0].address)
      .then(balance => {
        expect(balance).to.equal(realVal('1000000'));
      })
  });
});

describe("Success", () => {
  describe("Send Tokens", () => {
    let receipt;
    beforeEach(() => {
      let tokensVal = realVal('100');
      //tranfer tokens
      return token.connect(accounts[0])
        .transfer(accounts[1].address, tokensVal)
        .then(transaction => {
          transaction.wait()
            .then(transReceipt => {
              receipt = transReceipt;
            })
        })
    });
    it('Transfers token balances', () => {
      //ensure that tokens were taken from the account 0 (deployer)
      return token.balanceOf(accounts[0].address)
        .then(balanceAdm => {
          expect(balanceAdm).to.equal(realVal((1000000 - 100).toString()));
        })
    });
    it('Updates balance of the receiver', () => {
      //ensure that tokens were sent to the account 1 (receiver)
      return token.balanceOf(accounts[1].address)
        .then(balanceNormalAccount => {
          expect(balanceNormalAccount).to.equal(realVal('100'));
        });
    });
    it("Emits a transfer event", () => {
      const transferEvent = receipt.events[0];
      expect(transferEvent.event).to.equal("Transfer");
      expect(transferEvent.args._from).to.equal(accounts[0].address);
      expect(transferEvent.args._to).to.equal(accounts[1].address);
      expect(transferEvent.args._value).to.equal(realVal("100"));
    });
  });
  describe('Approving tokens', () => {
    let amount, transaction, receipt;

    beforeEach(() => {
      amount = realVal("100");
      return token.connect(accounts[0]).approve(accounts[1].address, amount)
        .then(tx => {
          transaction = tx;
          tx.wait().then(awaitedTx => {
            receipt = awaitedTx;
          })
        })
    });

    it("Allow a certain account to spend tokens", () => {
      return token.allowance(accounts[0].address, accounts[1].address)
        .then(allowance_value => {
          expect(allowance_value).to.be.equal(realVal("100"));
        });
    });

    it("Needs to throw a approval event", () => {
      let event = receipt.events[0];
      let args = event.args;
      expect(event.event).to.be.equal("Approval");
      expect(args._owner).to.be.equal(accounts[0].address);
      expect(args._spender).to.be.equal(accounts[1].address);
      expect(args._value).to.be.equal(realVal("100"));
    });

  });
  describe("Delegated tokens Transfers", () => {
    let amount = realVal(100);
    let receipt;
    beforeEach(() => {
      return token.connect(accounts[0])
        .approve(accounts[1].address, amount)
        .then(tx => {
          return tx.wait()
            .then(receiptTx => {
              return token.connect(accounts[1])
                .transferFrom(accounts[0].address, accounts[2].address, amount)
                .then(txTF => {
                  return txTF.wait()
                    .then(receiptTF => {
                      receipt = receiptTF;
                    })
                })
            })
        })
    });
    it("Transfer the tokens", () => {
      return token.balanceOf(accounts[2].address)
        .then(balance => {
          expect(balance).to.be.equal(amount);
        })
    });
    it("Throws a transfer event", () => {
      let event = receipt.events[0];
      let args = event.args;
      expect(event.event).to.be.equal("Transfer");
      expect(args._from).to.be.equal(accounts[0].address);
      expect(args._to).to.be.equal(accounts[2].address);
      expect(args._value).to.be.equal(amount);
    });
  });
});

describe("Failure", () => {
  describe("Transfer tokens", () => {
    it('Rejects insufficient balances', async () => {
      const invalidAmount = realVal("1000000000");
      await expect(token.connect(accounts[0]).transfer(accounts[1].address, invalidAmount)).to.be.reverted;
    });
    it("You cannot send tokens to invalid addresses", async () => {
      const invalidAmount = realVal("1000000000");
      await expect(token.connect(accounts[0]).transfer("0x0000000000000000000000000000000000000000", invalidAmount)).to.be.reverted;
    });
  });
  describe("Approval", () => {
    it("Should not allow to approve more than the balance of the sender", () => {
      let invalidAmount = realVal("100000000000000000");
      return token.connect(accounts[0])
        .approve(accounts[1].address, invalidAmount)
        .then(ok => {
          throw new Error("Transaction should have reverted");
        })
        .catch(nok => {
          expect(nok.message).to.include('revert');
          expect(nok.message).to.include("You must have enought balance to approve someone to spend your tokens");
        })
    });

    it("Should not allow to approve tokens to invalid addresses", () => {
      let amount = realVal("100");
      let invalidAddress = "0x0000000000000000000000000000000000000000";
      return token.connect(accounts[0])
        .approve(invalidAddress, amount)
        .then(ok => {
          throw new Error("It cannot give a error with a invalid address");
        })
        .catch(nok => {
          expect(nok.message).to.include('revert');
          expect(nok.message).to.include("The address you are approving to use your tokens is not valid");
        })
    });

  });
  describe('Delegating tokens', () => {
    it("Should not allow to send tokens without enought allowance", () => {
      let amount = realVal("100");
      return token.connect(accounts[1])
        .transferFrom(accounts[0].address, accounts[2].address, amount)
        .then(tx => {
          throw new Error("It should revert because no allowance has conceived");
        })
        .catch(err => {
          expect(err.message).to.include("revert");
          expect(err.message).to.include("You don't have enough allowance");
        })
    });
    it("Should not allow to send tokens to invalid addresses", () => {
      let amount = realVal("100");
      let invalidAddress = "0x0000000000000000000000000000000000000000";
      return token.connect(accounts[0])
        .approve(accounts[1].address, amount)
        .then(tx => {
          return tx.wait()
            .then(receipt_approval => {
              return token.connect(accounts[1])
                .transferFrom(accounts[0].address, invalidAddress, amount)
                .then(txTF => {
                  throw new Error("It should revert because the address is invalid");
                })
                .catch(err => {
                  expect(err.message).to.include("revert");
                  expect(err.message).to.include("Please send the tokens to a valid address");
                })
            })
        })
    });
    it("Should not allow to send tokens despite having allowance, when the owner of the account does not have balance", () => {
      let amount = realVal(100);
      return token.connect(accounts[0])
        .transfer(accounts[1].address, amount)
        .then(tx_transfer_initial => {
          return tx_transfer_initial.wait()
            .then(receipt_transfer_initial => {
              return token.connect(accounts[1])
                .approve(accounts[2].address, amount)
                .then(tx_approve_initial => {
                  return tx_approve_initial.wait()
                    .then(receipt_approve_initial => {
                      return token.connect(accounts[1])
                        .transfer(accounts[0].address, amount)
                        .then(tx_transfer_back_to_zero => {
                          return tx_transfer_back_to_zero.wait()
                            .then(receipt_transfer_back_to_zero => {
                              return token.connect(accounts[2])
                                .transferFrom(accounts[1].address, accounts[0].address, amount)
                                .then(tx_transfer_attemp_allowance_but_no_founds => {
                                  throw new Error("You cannot transfer tokens, despite having allowance because there is no balance");
                                })
                                .catch(err => {
                                  expect(err.message).to.include("revert");
                                  expect(err.message).to.include("The account that you are taking tokens from does not have enought balance");
                                })
                            })
                        })
                    })
                })
            })
        })
    })
  });
});
