const hre = require("hardhat")
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
    const Dapp = await ethers.getContractAt('Token', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9')
    console.log(`Dapp token fetches: ${Dapp.address}`)
    //? GET mETH
    const mETH = await ethers.getContractAt('Token', '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9')
    console.log(`mETH token fetches: ${mETH.address}`)
    //? GET mDAI
    const mDAI = await ethers.getContractAt('Token', '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707')
    console.log(`mDAI token fetches: ${mDAI.address}`)
    //? GET THE EXCHANGE
    const exchange = await ethers.getContractAt('Exchange', '0x610178dA211FEF7D417bC0e6FeD39F05609AD788')
    console.log(`The exchange address is: ${exchange.address}`)
    /* 
    ! GET DETAILS
    */
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = realVal(10000)

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
    console.log(`APproved ${amount} tokens from ${user1.address}\n`)
    //* Deposit 10000 tokens to exchange
    transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} Ether from ${user1.address}\n`)
    //* User 2 approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user2.address}`)

    //* Seed a canceled Order

    //* User1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, realVal(100), Dapp.address, realVal(5))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}`)

    //* user1 cancels order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancel order from ${user1.address}\n`)

    await wait(1)

    //* Seed Filled Orders

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, realVal(100), Dapp.address, realVal(5))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, realVal(50), Dapp.address, realVal(15))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* User1 makes order to get tokens
    transaction = await exchange.connect(user1).makeOrder(mETH.address, realVal(200), Dapp.address, realVal(20))
    result = await transaction.wait()
    console.log(`Make order from ${user1.address}\n`)

    //* User2 fills order
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    await wait(1)

    //* Seed open orders

    //* User1 makes 10 orders
    for (let index = 0; index < 10; index++) {
        exchange.connect(user1).makeOrder(mETH.address, realVal(10 * i), Dapp.address, realVal(10))
        result = await transaction.wait()
        console.log(`Make order from ${user1.address}\n`)
        await wait(1)
    }

    //* User2 makes 10 orders
    for (let index = 0; index < 10; index++) {
        exchange.connect(user1).makeOrder(Dapp.address, realVal(10 * i), mETH.address, realVal(10))
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

