require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    /* BY LEAVING IT EMPTY IT KNOW THAT IT IS A LOCAL NETWORK */
    localhost: {}
  },
  hardhat: {
    stackTrace: {
      disable: true
    }
  }
};
