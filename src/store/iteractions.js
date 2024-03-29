import { ethers } from 'ethers'
import tokenJSON from "../contractsJSON/Token.json"
import exchangeJSON from "../contractsJSON/Exchange.json"

export const loadProvider = (dispatch) => {
    //? Make the connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //? We should provide the type and also the connection that we want to pass to it
    dispatch({ type: 'PROVIDER_LOADED', connection: provider })
    return provider
}

export const loadNetwork = async (provider, dispatch) => {
    //? Get the network
    const { chainId } = await provider.getNetwork()
    dispatch({ type: 'NETWORK_LOADED', chainId: chainId })
    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    //? Get the accounts
    const accounts = await window.ethereum.request(
        { method: 'eth_requestAccounts' }
    )
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account: account })
    //? Get the balance
    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol
    //? DAP TOKEN
    token = new ethers.Contract(addresses[0], tokenJSON.abi, provider)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

    //? mETH TOKEN/mDAI TOKEN
    token = new ethers.Contract(addresses[1], tokenJSON.abi, provider)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, exchangeJSON.abi, provider)
    dispatch({ type: 'EXCHANGE_LOADED', contract: exchange })
    return exchange
}

export const loadBalances = async (exchange, tokens, account, dispatch) => {
    //? Get the balance and format it
    let balance = await tokens[0].balanceOf(account)
    balance = ethers.utils.formatUnits(balance, 18)
    dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })
    //? Balance token2
    balance = await tokens[1].balanceOf(account)
    balance = ethers.utils.formatUnits(balance, 18)
    dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })
    //? Get balance and format it but now for the exchange
    balance = await exchange.balanceOf(tokens[0].address, account)
    balance = ethers.utils.formatUnits(balance, 18)
    dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })
    //? Get balance and format it but now for the exchange for token2
    balance = await exchange.balanceOf(tokens[1].address, account)
    balance = ethers.utils.formatUnits(balance, 18)
    dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
    if (transferType === 'Deposit') {
        //? Throw a event
        dispatch({ type: "TRANSFER_REQUEST" })
        //? Approve the amount of tokens we want the exchange to use
        var transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
        await transaction.wait()
        //? Make the deposit
        transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
        await transaction.wait()
    } else {
        //? Make the deposit
        const transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
        await transaction.wait()
    }
}

//? For subscribing event
export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on('Trade', (id, user, tokenGet, tokenGive, amountGet, amountGive, creator,fee, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'ORDER_FILL_SUCCESS', order, event })
    })
    exchange.on('CancelEvent', (id, user, tokenGet, tokenGive, amountGet, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event })
    })
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        //? Notify that it got successfull
        dispatch({ type: 'TRANSFER_SUCCESS', event })
    })
    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event })
    })
    exchange.on('OrderEvent', (id, user, tokenGet, tokenGive, amountGet, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'NEW_ORDER_SUCCESS', order, event })
    })
}

export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {
    //? Get the necessary means
    const tokenGet = tokens[1].address
    const amountGet = ethers.utils.parseUnits(order.amount, 18)
    const tokenGive = tokens[0].address
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
    dispatch({ type: 'NEW_ORDER_REQUEST' })
    try {
        //? Get the signer
        const signer = await provider.getSigner()
        //? Make the transaction itself
        const transaction = await exchange.connect(signer).makeOrder(
            tokenGet,
            tokenGive,
            amountGet,
            amountGive
        )
        await transaction.wait()
    } catch (error) {
        dispatch({ type: 'NEW_ORDER_FAIL' })
    }
}

export const makeSellerOrder = async (provider, exchange, tokens, order, dispatch) => {
    //? Get the necessary means
    const tokenGet = tokens[0].address
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
    const tokenGive = tokens[1].address
    const amountGive = ethers.utils.parseUnits(order.amount, 18)
    dispatch({ type: 'NEW_ORDER_REQUEST' })
    try {
        //? Get the signer
        const signer = await provider.getSigner()
        //? Make the transaction itself
        const transaction = await exchange.connect(signer).makeOrder(
            tokenGet,
            tokenGive,
            amountGet,
            amountGive
        )
        await transaction.wait()
    } catch (error) {
        dispatch({ type: 'NEW_ORDER_FAIL' })
    }
}
//? This function loads all the orders
export const loadAllOrders = async (provider, exchange, dispatch) => {
    if (provider && exchange) {
        const block = await provider.getBlockNumber()
        //? Fetch canceled orders
        const cancelStream = await exchange.queryFilter('CancelEvent', 0, block)
        const cancelledOrders = cancelStream.map(event => event.args)
        dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders })
        //? Fetch filled orders
        const tradeStream = await exchange.queryFilter('Trade', 0, block)
        const filledOrders = tradeStream.map(event => event.args)
        dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })
        //? Fetch all orders
        const orderStream = await exchange.queryFilter('OrderEvent', 0, block)
        const allOrders = orderStream.map(event => event.args)
        dispatch({ type: 'ALL_ORDERS_LOADED', allOrders })
    }
}

//? Function to cancell order
export const cancelOrder = async (provider, exchange, order, dispatch) => {
    dispatch({ type: 'ORDER_CANCEL_REQUEST' })
    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).cancelOrder(order._id.toNumber())
        await transaction.wait()
    } catch (error) {
        dispatch({ type: 'ORDER_CANCEL_FAIL' })
    }
}

//? Function to fill a certain order
export const fillOrder = async (provider, exchange, order, dispatch) => {
    dispatch({ type: 'ORDER_FILL_REQUEST' })
    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).fillOrder(order._id)
        await transaction.wait()
    } catch (error) {
        dispatch({ type: 'ORDER_FILL_FAIL' })
    }
}