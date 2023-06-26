const { expect } = require("chai");
const { ethers } = require("hardhat");
/* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
CONSIDERING THE DECIMALS */
const realVal = (_number_of_tokens) => {
    return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');
}
describe('Exchange', () => {
    let deployer, feeAccount, exchange;
    let feePercent = 10;
    //FUNCTION TO RUN BEFORE RUNNING THE TESTS
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address,feePercent);
    });
    describe('Deployment', () => {
        it("Tracks the fee account", () => {
            exchange.feeAccount()
                .then(feeAcc => {
                    expect(feeAcc).to.equal(feeAccount);
                })
        });
        it("Tracks the fee percent",()=>{
            exchange.feePercent()
            .then(feeP=>{
                expect(feeP).to.equal(feePercent);
            })
        })
    });
})
