const hre = require("hardhat");

async function main() {
    /* FETCH CONTRACT TO DEPLOY */
    const Token = await hre.ethers.getContractFactory("Token");
    /* DEPLOY IT */
    const deployedContract = await Token.deploy();
    /* AWAIT THE DEPLOYMENT */
    await deployedContract.deployed();
    /* PRINT THE INFORMATION */
    console.log(`This is the contract address from the deployed contract: ${deployedContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
