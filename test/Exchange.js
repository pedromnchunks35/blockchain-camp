const { expect } = require("chai");
const { ethers } = require("hardhat");

/* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
CONSIDERING THE DECIMALS */
const realVal = (_number_of_tokens) => {

    return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');

}

describe('Exchange', () => {
    let deployer, feeAccount, exchange, tokenDapp, tokenTwo, user1, user2, user3;
    let feePercent = 10;
    let valueSent = realVal(100);

    //FUNCTION TO RUN BEFORE RUNNING THE TESTS
    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange');
        const Token = await ethers.getContractFactory('Token');
        const Token2 = await ethers.getContractFactory('Token');
        tokenDapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
        tokenTwo = await Token2.deploy('Another token', 'ANT', '1000000');
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];
        user2 = accounts[3];
        user3 = accounts[4];
        exchange = await Exchange.deploy(feeAccount.address, feePercent);
        //? TRANSFER 100 TOKENS TO THE ACCOUNT WE ARE TESTING OUT LATER
        let transaction = await tokenDapp.connect(deployer).transfer(user1.address, valueSent);
        let tx2 = await tokenTwo.connect(deployer).transfer(user2.address, valueSent);
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

            beforeEach(async () => {
                //? MAKE THE APPROVE IN THE TOKEN DAPP TO ALLOW THE CONTRACT TO TRANSFER THE TOKENS TO HIM-SELF ON HIS BEHALF
                let approve_tx = await tokenDapp.connect(user1).approve(exchange.address, amount)
                await approve_tx.wait()
                let deposit_tx = await exchange.connect(user1).depositToken(tokenDapp.address, amount)
                result = await deposit_tx.wait()
            });

            it("Tracks the token deposit", async () => {
                //? CHECK THE EXCHANGE BALANCE OF DAP TOKENS
                let exchange_balance = await tokenDapp.balanceOf(exchange.address)
                expect(exchange_balance).to.equal(amount);
                //? CHECK THE DEPOSITS OF THE USER
                let user1_inside_exchange_balance = await exchange.tokens(tokenDapp.address, user1.address)
                expect(user1_inside_exchange_balance).to.equal(amount);

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
            it('Fails when no tokens are approved', async () => {
                exchange.connect(user1).depositToken(tokenDapp.address, amount)
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

    describe('Making orders', () => {

        let result;
        let amount = realVal(50);
        let token_creator_wants = realVal(30);
        let token_creator_gives = realVal(10);

        describe('Success', () => {

            beforeEach(async () => {
                //? approve the exchange to spend a certain amount of tokens of user1
                let approve_tx = await tokenDapp.connect(user1).approve(exchange.address, amount)
                await approve_tx.wait()
                //? make a deposit of 50 tokens in exchange
                let deposit_tx = await exchange.connect(user1).depositToken(tokenDapp.address, amount)
                await deposit_tx.wait()
                //? make a order
                let order_tx = await exchange.connect(user1).makeOrder(
                    tokenTwo.address,
                    tokenDapp.address,
                    token_creator_wants,
                    token_creator_gives
                )
                result = await order_tx.wait()
            });

            it("Tracks the id correctly", () => {
                return exchange.connect(user1)
                    .orderCount()
                    .then(idOrderer => {
                        expect(idOrderer).to.equal(1);
                    })
            });

            it("Creates the order", () => {
                return exchange.connect(user1)
                    .orders(1)
                    .then(order => {
                        expect(order._id).to.equal(1);
                        expect(order._token_creator_wants).to.equal(tokenTwo.address);
                        expect(order._token_creator_is_giving).to.equal(tokenDapp.address);
                        expect(order._amount_token_cw).to.equal(token_creator_wants);
                        expect(order._amount_token_cg).to.equal(token_creator_gives);
                        expect(order._timestamp).to.at.least(1);
                    });
            });

            it("Emits order event", () => {
                const event = result.events[0];
                expect(event.event).to.equal("OrderEvent");
                const args = event.args;
                expect(args._id).to.equal(1);
                expect(args._token_creator_wants).to.equal(tokenTwo.address);
                expect(args._token_creator_is_giving).to.equal(tokenDapp.address);
                expect(args._amount_token_cw).to.equal(token_creator_wants);
                expect(args._amount_token_cg).to.equal(token_creator_gives);
                expect(args._timestamp).to.at.least(1);
            })
        });

        describe('Failure', () => {
            it("Rejects with no balance", () => {
                return exchange.connect(user1)
                    .makeOrder(
                        tokenDapp.address,
                        tokenTwo.address,
                        1,
                        200000
                    )
                    .then()
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("You don't have enought balance to give");
                    })
            })
        });

    });

    describe("Cancel order", () => {
        let amount = realVal(10);
        let amountGet = realVal(10);
        let amountGive = realVal(10);

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
                                            return exchange.connect(user1)
                                                .makeOrder(
                                                    tokenTwo.address,
                                                    tokenDapp.address,
                                                    amountGet,
                                                    amountGive
                                                ).then(makeOrder_tx => {
                                                    return makeOrder_tx.wait()
                                                        .then(makeOrder_result => {
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });

        describe('Success', () => {

            let result;
            let amount = realVal(10);
            let amountGet = realVal(10);
            let amountGive = realVal(10);

            beforeEach(() => {
                return exchange.connect(user1)
                    .cancelOrder(1)
                    .then(tx_cancel_order => {
                        return tx_cancel_order.wait()
                            .then(cancel_order_result => {
                                result = cancel_order_result;
                            });
                    });
            })

            it("Cancels the order", () => {
                return exchange.connect(user1)
                    .canceledOrders(1)
                    .then(isCanceled => {
                        expect(isCanceled).to.equal(true);
                    });
            });

            it("Emits the event", () => {
                const event = result.events[0];
                expect(event.event).to.equal("CancelEvent");
                const args = event.args;
                expect(args._id).to.equal(1);
                expect(args._token_creator_wants).to.equal(tokenTwo.address);
                expect(args._token_creator_is_giving).to.equal(tokenDapp.address);
                expect(args._amount_token_cw).to.equal(amountGet);
                expect(args._amount_token_cg).to.equal(amountGive);
                expect(args._timestamp).to.at.least(1);
            });
        });

        describe('Failure', () => {
            it("Reverts case you are cancelling without beeing the owner", () => {
                return exchange.connect(user2)
                    .cancelOrder(1)
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("You need to be the owner to cancel a order");
                    });
            });

            it("Reverts case you give a non existent id", () => {
                return exchange.connect(user1)
                    .cancelOrder(100)
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("The given id does not exists");
                    });
            });
        });

    })

    describe("Fill order", () => {
        let amount = realVal(10);
        let amount_for_token_two = realVal(20);
        let amountGet = realVal(10);
        let amountGive = realVal(10);
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
                                            return exchange.connect(user1)
                                                .makeOrder(
                                                    tokenTwo.address,
                                                    tokenDapp.address,
                                                    amountGet,
                                                    amountGive
                                                ).then(makeOrder_tx => {
                                                    return makeOrder_tx.wait()
                                                        .then(makeOrder_result => {
                                                            return tokenTwo.connect(user2).
                                                                approve(exchange.address, amount_for_token_two)
                                                                .then(approve_tx_two => {
                                                                    return approve_tx_two.wait()
                                                                        .then(approve_result_two => {
                                                                            return exchange.connect(user2).
                                                                                depositToken(tokenTwo.address, amount_for_token_two)
                                                                                .then(deposit_tx_two => {
                                                                                    return deposit_tx_two.wait()
                                                                                        .then(deposit_result_two => { });
                                                                                });
                                                                        });
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
        });

        describe('Success', () => {
            let result;
            beforeEach(() => {
                return exchange.connect(user2)
                    .fillOrder(1)
                    .then(fill_tx => {
                        return fill_tx.wait()
                            .then(fill_result => {
                                result = fill_result;
                            });
                    });
            });

            it("Swapes corretly the tokens and charges the fee", () => {
                return exchange.connect(user1)
                    .balanceOf(tokenDapp.address, user1.address)
                    .then(tokenDapp_balance_user1 => {
                        expect(tokenDapp_balance_user1).to.equal(0);
                        return exchange.connect(user1)
                            .balanceOf(tokenTwo.address, user1.address)
                            .then(tokenTwo_balance_user1 => {
                                expect(tokenTwo_balance_user1).to.equal(amountGet);
                                return exchange.connect(user2)
                                    .balanceOf(tokenDapp.address, user2.address)
                                    .then(tokenDapp_balance_user2 => {
                                        expect(tokenDapp_balance_user2).to.equal(amountGive);
                                        return exchange.connect(user2)
                                            .balanceOf(tokenTwo.address, user2.address)
                                            .then(tokenTwo_balance_user2 => {
                                                expect(tokenTwo_balance_user2).to.equal(realVal(9));
                                            });
                                    });
                            });
                    });
            });

            it("Emits the event trade", () => {
                const event = result.events[0];
                expect(event.event).to.equal("Trade");
                const args = event.args;
                expect(args._id).to.equal(1);
                expect(args._creator).to.equal(user1.address);
                expect(args._the_interested).to.equal(user2.address);
                expect(args._token_creator_wants).to.equal(tokenTwo.address);
                expect(args._token_creator_is_giving).to.equal(tokenDapp.address);
                expect(args._amount_token_cw).to.equal(amountGet);
                expect(args._amount_token_cg).to.equal(amountGive);
                expect(args._timestamp).to.at.least(1);
            })

            it("Fills the order", () => {
                return exchange.connect(user1)
                    .filledOrders(1)
                    .then(isFilled => {
                        expect(isFilled).to.equal(true);
                    })
            })
        });

        describe('Failure', () => {
            it("Should revert because of invalid id", () => {
                return exchange.connect(user2)
                    .fillOrder(100)
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("The given id does not exists");
                    })
            });

            it("Should revert because it is already filled", () => {
                return exchange.connect(user2)
                    .fillOrder(1)
                    .catch(err => {
                        expect(err.message).to.include("revert");
                        expect(err.message).to.include("The order cannot be a filled one");
                    });
            });

            it("Should revert because it cannot be a cancelled order", () => {
                return exchange.connect(user1)
                    .cancelOrder(1)
                    .then(tx_cancelled => {
                        return tx_cancelled.wait()
                            .then(canceled_result => {
                                return exchange.connect(user2)
                                    .fillOrder(1)
                                    .catch(err => {
                                        expect(err.message).to.include("revert");
                                        expect(err.message).to.include("The order cannot be a canceled one");
                                    });
                            });
                    })
            });

        });

    });
});
