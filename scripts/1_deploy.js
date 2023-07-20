const hre = require("hardhat");
async function main() {
    /* FETCH CONTRACT TO DEPLOY */
    const Token = await hre.ethers.getContractFactory("Token");
    /*FETCH EXCHANGE*/
    const Exchange = await hre.ethers.getContractFactory('Exchange')
    const accounts = await hre.ethers.getSigners()
    console.log("Accounts fetches: " + accounts[0].address)
    /* DEPLOY IT */
    const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000');
    console.log(`Dapp deployed to: ${dapp.address}`)
    const mETH = await Token.deploy('mETH', 'mETH', '1000000')
    console.log(`mETH deployed to: ${mETH.address}`)
    const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
    console.log(`mDAI deployed to: ${mDAI.address}`)
    /* AWAIT THE DEPLOYMENT */
    await dapp.deployed();
    await mETH.deployed();
    await mDAI.deployed();
    /* DEPLOY THE EXCHANGE */
    const exchange = await Exchange.deploy(accounts[1].address, 10)
    console.log(`The exchange is deployed at: ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
