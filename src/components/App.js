import "../App.css"
import React,{useState,useEffect} from 'react'
import {ethers} from 'ethers'
import contractDetails from "../config.json"
import tokenJSON from "../contractsJSON/Token.json"
function App(){
    //? LINK TO THE BLOCKCHAIN
    const loadBlockchainData = async () => {
        //? Get the accounts
        const accounts = await window.ethereum.request(
            { method: 'eth_requestAccounts' }
        )
        //? Make the connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //? Get the network
        const {chainId} = await provider.getNetwork()
        console.log(chainId)
        //? Get the smart contract
        const token = new ethers.Contract(
            contractDetails[31337].dapp.address,
            tokenJSON.
            abi,provider
            )
        console.log(token.address)
        const symbol  = await token.symbol()
        console.log(symbol)
    }

    //? INITIAL LOAD IN REACT
    useEffect(()=>{
        loadBlockchainData()
    })
    return (
        <div>

            {/* Navbar */}

            <main className='exchange grid'>
                <section className='exchange__section--left grid'>

                    {/* Markets */}

                    {/* Balance */}

                    {/* Order */}

                </section>
                <section className='exchange__section--right grid'>

                    {/* PriceChart */}

                    {/* Transactions */}

                    {/* Trades */}

                    {/* OrderBook */}

                </section>
            </main>

            {/* Alert */}

        </div>
    );
}

export default App;