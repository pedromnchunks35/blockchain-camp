import React, { useEffect } from 'react'
import contractDetails from "../config.json"
import { useDispatch } from 'react-redux'
import {
    loadAccount,
    loadNetwork,
    loadProvider,
    loadTokens,
    loadExchange,
    subscribeToEvents,
    loadAllOrders
} from '../store/iteractions'
import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'
import Order from './Order'
import OrderBook from './OrderBook'
import PriceChart from './PriceChart'
import Trades from './Trades'
import Transactions from './MyTransactions'
import Alert from './Alert'
function App() {
    //? Assign the use dispatch to a variable
    const dispatch = useDispatch()
    //? LINK TO THE BLOCKCHAIN
    const loadBlockchainData = async () => {


        //? Make the connection to the blockchain
        const provider = loadProvider(dispatch)

        await loadNetwork(provider, dispatch)

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
        const exchange = await loadExchange(
            provider,
            contractDetails[31337].Exchange.address,
            dispatch
        )
        //? FETCH ALL ORDERS: open,filled,cancelled
        loadAllOrders(provider, exchange, dispatch)

        //? Listen the events
        try {
            subscribeToEvents(exchange, dispatch)
        } catch (error) {
            console.log(error)
        }
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
                    <Markets />

                    {/* Balance */}
                    <Balance />
                    {/* Order */}
                    <Order />
                </section>
                <section className='exchange__section--right grid'>

                    {/* PriceChart */}
                    <PriceChart />
                    {/* Transactions */}
                    <Transactions />
                    {/* Trades */}
                    <Trades />
                    {/* OrderBook */}
                    <OrderBook />
                </section>
            </main>

            {/* Alert */}
            <Alert />
        </div>
    );
}

export default App;