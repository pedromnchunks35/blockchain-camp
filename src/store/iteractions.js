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
    //? Throw a event
    dispatch({ type: "TRANSFER_REQUEST" })
    //? Approve the amount of tokens we want the exchange to use
    const transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
    await transaction.wait()
    //? Make the deposit
    transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
    await transaction.wait()
}

//? For subscribing events
export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        //? Notify that it got successfull
        dispatch({ type: 'TRANSFER_SUCCESS', event })  
    })
}