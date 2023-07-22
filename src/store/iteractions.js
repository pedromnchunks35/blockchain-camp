import { ethers } from 'ethers'
import tokenJSON from "../contractsJSON/Token.json"

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

export const loadAccount = async (dispatch) => {
    //? Get the accounts
    const accounts = await window.ethereum.request(
        { method: 'eth_requestAccounts' }
    )
    const account = ethers.utils.getAddress(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account: account })
    return account
}

export const loadToken = async (provider, address, dispatch) => {
    let token, symbol
    token = new ethers.Contract(address, tokenJSON.abi, provider)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_LOADED', token, symbol })
    return token
}