require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
//? add the private keys
const privateKeys = process.env.PRIVATE_KEYS || ""
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    /* BY LEAVING IT EMPTY IT KNOW THAT IT IS A LOCAL NETWORK */
    localhost: {},
    auroratestnet: {
      url: "https://aurora-testnet.infura.io/v3/"+process.env.INFURA_API_KEY,
      accounts: privateKeys.split(","),
    }
  },
  hardhat: {
    stackTrace: {
      disable: true
    }
  }
};
