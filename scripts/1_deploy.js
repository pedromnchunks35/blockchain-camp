const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

function modifyJsonInAnotherDirectory(filePath,key,newData) {
    // Resolve the absolute file path
    const absoluteFilePath = path.resolve(filePath);
  
    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
      console.log(`Error: The file '${absoluteFilePath}' does not exist.`);
      return;
    }
  
    // Read the JSON data from the file
    fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading file: ${err}`);
        return;
      }
  
      // Parse the JSON data
      let json_data = JSON.parse(data);
  
      // Modify the JSON data
      // Example: Suppose you want to update a key 'name' with a new value
      json_data["31337"][key].address = newData;
  
      // Write the modified JSON data back to the file
      fs.writeFile(absoluteFilePath, JSON.stringify(json_data, null, 2), 'utf8', (err) => {
        if (err) {
          console.log(`Error writing file: ${err}`);
        } else {
          console.log(`Successfully updated the JSON data in '${absoluteFilePath}'.`);
        }
      });
    });
  }

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
    modifyJsonInAnotherDirectory("./src/config.json","dapp",dapp.address)
    modifyJsonInAnotherDirectory("./scripts/config.json","dapp",dapp.address)
    const mETH = await Token.deploy('mETH', 'mETH', '1000000')
    console.log(`mETH deployed to: ${mETH.address}`)
    modifyJsonInAnotherDirectory("./src/config.json","mETH",mETH.address)
    modifyJsonInAnotherDirectory("./scripts/config.json","mETH",mETH.address)
    const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
    console.log(`mDAI deployed to: ${mDAI.address}`)
    modifyJsonInAnotherDirectory("./src/config.json","mDAI",mDAI.address)
    modifyJsonInAnotherDirectory("./scripts/config.json","mDAI",mDAI.address)
    /* AWAIT THE DEPLOYMENT */
    await dapp.deployed();
    await mETH.deployed();
    await mDAI.deployed();
    /* DEPLOY THE EXCHANGE */
    const exchange = await Exchange.deploy(accounts[1].address, 10)
    console.log(`The exchange is deployed at: ${exchange.address}`)
    modifyJsonInAnotherDirectory("./src/config.json","Exchange",exchange.address)
    modifyJsonInAnotherDirectory("./scripts/config.json","Exchange",exchange.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
