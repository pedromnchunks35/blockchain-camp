import React, { useEffect } from 'react'
import contractDetails from "../config.json"
import { useDispatch } from 'react-redux'
import {
    loadAccount,
    loadNetwork,
    loadProvider,
    loadToken
} from '../store/iteractions'

function App() {

    //? Assign the use dispatch to a variable
    const dispatch = useDispatch()

    //? LINK TO THE BLOCKCHAIN
    const loadBlockchainData = async () => {
        //? Get the accounts
        await loadAccount(dispatch)

        //? Make the connection to the blockchain
        const provider = loadProvider(dispatch)

        //? Get the network
        await loadNetwork(provider, dispatch)

        //? Get the smart contract
        await loadToken(
            provider,
            contractDetails[31337].dapp.address,
            dispatch
        )
    }

    //? INITIAL LOAD IN REACT
    useEffect(() => {
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