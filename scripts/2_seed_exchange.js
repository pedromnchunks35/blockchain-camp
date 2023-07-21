const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function readJsonProp (filePath, key){
    // Resolve the absolute file path
    const absoluteFilePath = path.resolve(filePath);

    // Check if the file exists
    if (!fs.existsSync(absoluteFilePath)) {
        console.log(`Error: The file '${absoluteFilePath}' does not exist.`);
        return;
    }
    
    // Read the JSON data from the file
    
    return new Promise((resolve,err)=>{
      fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
        let result
        if (err) {
            console.log(`Error reading file: ${err}`);
            return err(err)
        }

        // Parse the JSON data
        let json_data = JSON.parse(data);

        // Modify the JSON data
        // Example: Suppose you want to update a key 'name' with a new value
        result = json_data["31337"][key].address
        console.log(result)
        return resolve(result)
    });  
    })
    
    
}

/* FUNCTION TO TAKE A NUMBER OF TOKENS AND HAVE THAT
CONSIDERING THE DECIMALS */
const realVal = (_number_of_tokens) => {

    return ethers.utils.parseUnits(_number_of_tokens.toString(), 'ether');

}

const wait = (secounds) => {
    const milisecounds = secounds * 1000
    return new Promise(resolve => setTimeout(resolve, milisecounds))
}

async function main() {
    const accounts = await ethers.getSigners()
    //? GET DAPP
    const Dapp = await ethers.getContractAt('Token', readJsonProp("./scripts/config.json","dapp"))
    console.log(`Dapp token fetches: ${Dapp.address}`)
    //? GET mETH
    const mETH = await ethers.getContractAt('Token', readJsonProp("./scripts/config.json","mETH"))
    console.log(`mETH token fetches: ${mETH.address}`)
    //? GET mDAI
    const mDAI = await ethers.getContractAt('Token', readJsonProp("./scripts/config.json","mDAI"))
    console.log(`mDAI token fetches: ${mDAI.address}`)
    //? GET THE EXCHANGE
    const exchange = await ethers.getContractAt('Exchange', readJsonProp("./scripts/config.json","Exchange"))
    console.log(`The exchange address is: ${exchange.address}`)
    /* 
    ! GET DETAILS
    */
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = realVal(100000)

    /*
    * user1 transfers 10000 mETH
    */
    let transaction, result
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}`)

    /*
    ! Set more details about the operations we will be doing
    */
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = realVal(10000)

    //* user1 approves 10000 Dapp
    transaction = await Dapp.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}\n`)
    //* Deposit 10000 tokens to exchange
    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

    //* User 2 approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`)

    //* User 2 deposits mETH
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposit ${amount} mETH from ${user2.address}`)

    //* Seed a canceled Order

    //* User1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, Dapp.address, realVal(100), realVal(5))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}`)

    //* user1 cancels order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancel order from ${user1.address}\n`)

    await wait(1)

    //* Seed Filled Orders

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, Dapp.address, realVal(10), realVal(5))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, Dapp.address, realVal(10), realVal(15))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, Dapp.address, realVal(20), realVal(20))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* Seed open orders

    //* User1 makes 10 orders
    for (let index = 0; index < 10; index++) {
        exchange.connect(user1).makeOrder(mETH.address, Dapp.address, realVal(10 * index), realVal(10))
        result = await transaction.wait()
        console.log(`Make order from ${user1.address}\n`)
        await wait(1)
    }

    //* User2 makes 10 orders
    for (let index = 0; index < 10; index++) {
        exchange.connect(user1).makeOrder(Dapp.address, mETH.address, realVal(10 + index), realVal(10))
        result = await transaction.wait()
        console.log(`Make order from ${user1.address}\n`)
        await wait(1)
    }
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

