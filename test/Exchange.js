const { expect } = require("chai");
const { ethers } = require("hardhat");
/* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
CONSIDERING THE DECIMALS */
const realVal = (_number_of_tokens) => {

    return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');

}

describe('Exchange', () => {
    let deployer, feeAccount, exchange, tokenDapp, tokenTwo, user1;
    let feePercent = 10;
    let valueSent = realVal(100);

    //FUNCTION TO RUN BEFORE RUNNING THE TESTS
    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange');
        const Token = await ethers.getContractFactory('Token');
        const Token2 = await ethers.getContractFactory('Token');
        tokenDapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
        //? TRANSFER 100 TOKENS TO THE ACCOUNT WE ARE TESTING OUT LATER
        let transaction = await tokenDapp.connect(deployer).transfer(user1.address, valueSent);
    });

    describe('Deployment', () => {

        it("Tracks the fee account", () => {
            exchange.feeAccount()
                .then(feeAcc => {
                    expect(feeAcc).to.equal(feeAccount);
                })
        });

        it("Tracks the fee percent", () => {
            exchange.feePercent()
                .then(feeP => {
                    expect(feeP).to.equal(feePercent);
                });
        })

    });

    describe('Depositing tokens', () => {

        describe('Success', () => {
            let result;
            let amount = realVal(10);

            beforeEach(() => {
                //? MAKE THE APPROVE IN THE TOKEN DAPP TO ALLOW THE CONTRACT TO TRANSFER THE TOKENS TO HIM-SELF ON HIS BEHALF
                return tokenDapp.connect(user1)
                    .approve(exchange.address, amount)
                    .then(approve_tx => {
                        return approve_tx.wait()
                            .then(approve_result => {
                                //? MAKE THE DEPOSIT
                                return exchange.connect(user1)
                                    .depositToken(tokenDapp.address, amount)
                                    .then(deposit_tx => {
                                        return deposit_tx.wait()
                                            .then(deposit_result => {
                                                result = deposit_result;
                                            })
                                    });
                            });
                    });
            });

            it("Tracks the token deposit", () => {
                //? CHECK THE EXCHANGE BALANCE OF DAP TOKENS
                return tokenDapp.balanceOf(exchange.address)
                    .then(exchangeBalance => {
                        expect(exchangeBalance).to.equal(amount);
                        //? CHECK THE DEPOSITS OF THE USER
                        return exchange.tokens(tokenDapp.address, user1.address)
                            .then(exchangeBalanceUser1 => {
                                expect(exchangeBalanceUser1).to.equal(amount);
                            });
                    });
            });

            it('Emits a Deposit event', () => {
                const event = result.events[1]; //IT IS THE SECOUND EVENT
                expect(event.event).to.equal('Deposit');
                const args = event.args;
                expect(args._token).to.equal(tokenDapp.address);
                expect(args._user).to.equal(user1.address);
                expect(args._amount).to.equal(amount);
                expect(args._balance).to.equal(amount);
            });
        });

        describe('Failure', () => {
            let amount = realVal(10);
            it('Fails when no tokens are approved', () => {
                return exchange.connect(user1)
                    .depositToken(tokenDapp.address, amount)
                    .then()
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("You don't have enough allowance");
                    })
            });
        });
    });

    describe("Withdrawing Tokens", () => {
        let transaction, result;
        let amount = realVal(10);
        describe('Success', () => {
            beforeEach(() => {
                //? MAKE THE APPROVE IN THE TOKEN DAPP TO ALLOW THE CONTRACT TO TRANSFER THE TOKENS TO HIM-SELF ON HIS BEHALF
                return tokenDapp.connect(user1)
                    .approve(exchange.address, amount)
                    .then(approve_tx => {
                        return approve_tx.wait()
                            .then(approve_result => {
                                //? MAKE THE DEPOSIT
                                return exchange.connect(user1)
                                    .depositToken(tokenDapp.address, amount)
                                    .then(deposit_tx => {
                                        return deposit_tx.wait()
                                            .then(deposit_result => {
                                                //? MAKE THE WITHDRAW
                                                return exchange.connect(user1)
                                                    .withdrawToken(tokenDapp.address, amount)
                                                    .then(tx_withdraw => {
                                                        return tx_withdraw.wait()
                                                            .then(withdraw_result => {
                                                                result = withdraw_result;
                                                            })
                                                    })
                                            })
                                    });
                            });
                    });

            });
            it("Withaws token funds", () => {
                return exchange.connect(user1)
                    .balanceOf(tokenDapp.address, user1.address)
                    .then(user1_balance_exchange => {
                        expect(user1_balance_exchange).to.equal(0);
                        return tokenDapp.connect(user1)
                            .balanceOf(user1.address)
                            .then(user1_balance_tokenDapp => {
                                expect(user1_balance_tokenDapp).to.equal(valueSent);
                            })
                    })
            });
            it("Emits a withdraw event", () => {
                const event = result.events[1];
                expect(event.event).to.equal("Withdraw");
                const args = event.args;
                expect(args._token).to.equal(tokenDapp.address);
                expect(args._user).to.equal(user1.address);
                expect(args._amount).to.equal(amount);
                expect(args._balance).to.equal(0);
            });
        });
        describe("Failure", () => {
            it("Reverts when there is no balance", () => {
                return exchange.connect(user1)
                    .withdrawToken(tokenDapp.address, realVal(100))
                    .then()
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("You don't have enought balance of that token to withdraw");
                    });
            })
        });
    });
});
