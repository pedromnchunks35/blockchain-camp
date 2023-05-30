const { expect } = require("chai");
const { ethers } = require("hardhat");
// CONTAINER FOR TESTINGS
describe('Token', () => {
  let token;
  /* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
  CONSIDERING THE DECIMALS */
  const realVal = (_number_of_tokens) => {
    return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');
  }
  //FUNCTION TO RUN BEFORE RUNNING THE TESTS
  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy('Dapp University', "DAPP", 1000000);
  });
  //MAKING ALL THE TESTS OUT
  //CHECK THE NAME
  it('Has correct Name', async () => {
    //READ TOKEN NAME
    token.name()
      .then((name) => {
        //CHECK IF THE NAME MATCHES
        expect(name).to.equal("Dapp University");
      });
  });
  //CHECK SYMBOL
  it("Has correct Symbol", () => {
    token.symbol()
      .then((symbol) => {
        expect(symbol).to.equal("DAPP");
      });
  });
  //CHECK TOTAL SUPPLY
  it("Has the correct total Supply", () => {
    token.totalSupply()
      .then(ts => {
        /* SINCE OUR DECIMALS ARE 18, 
        WHAT HAPPENS IS THAT WHEN WE PASS THE VALUE TO WEI SAYING THAT 
        IT REPRESENTS ETHER , IT WILL CONVERT CORRECTLY THE VALUE */
        const value = ethers.utils.parseUnits('10000000', 'ether');
        expect(ts).to.equal(value);
      });
  });
});