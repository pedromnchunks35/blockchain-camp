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

export const loadAccount = async (provider,dispatch) => {
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

    //? mETH TOKEN
    token = new ethers.Contract(addresses[1], tokenJSON.abi, provider)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

    //? mDAI TOKEN
    token = new ethers.Contract(addresses[2], tokenJSON.abi, provider)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_3_LOADED', token, symbol })

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, exchangeJSON.abi, provider)
    dispatch({ type: 'EXCHANGE_LOADED', contract: exchange.address })
    return exchange
}