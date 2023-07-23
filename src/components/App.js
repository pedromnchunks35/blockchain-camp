import React, { useEffect } from 'react'
import contractDetails from "../config.json"
import { useDispatch } from 'react-redux'
import {
    loadAccount,
    loadNetwork,
    loadProvider,
    loadTokens,
    loadExchange
} from '../store/iteractions'
import Navbar from './Navbar'

function App() {

    //? Assign the use dispatch to a variable
    const dispatch = useDispatch()

    //? LINK TO THE BLOCKCHAIN
    const loadBlockchainData = async () => {


        //? Make the connection to the blockchain
        const provider = loadProvider(dispatch)

        //? Just in case the wallet is already connected, or in case
        //? we change account or somethign like that
        window.ethereum.on('accountsChanged', async () => {
            await loadAccount(provider, dispatch)
        })

        // Reload page when network changes
        window.ethereum.on('chainChanged', () => {
            window.location.reload()
        })


        //? Get the tokens
        await loadTokens(
            provider,
            [
                contractDetails[31337].dapp.address,
                contractDetails[31337].mETH.address,
                contractDetails[31337].mDAI.address
            ],
            dispatch
        )

        //? Get the exchange
        await loadExchange(
            provider,
            contractDetails[31337].Exchange.address,
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
            <Navbar />
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