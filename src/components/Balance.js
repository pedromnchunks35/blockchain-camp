import dapp from '../assets/dapp.svg'
import eth from '../assets/eth.svg'
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    loadBalances,
    transferTokens
} from '../store/iteractions';
import { useDispatch } from 'react-redux';

const Balance = () => {
    const [isDeposit, setIsDeposit] = useState(true)
    const depositRef = useRef(null)
    const WithdrawRef = useRef(null)
    const [token1TransferAmount, setToken1TransferAmount] = useState(0)
    const [token2TransferAmount, setToken2TransferAmount] = useState(0)
    const dispatch = useDispatch()
    const provider = useSelector(state => state.provider.connection)
    const symbols = useSelector(state => state.tokens.symbols)
    const exchange = useSelector(state => state.exchange.contract)
    const tokens = useSelector(state => state.tokens.contracts)
    const account = useSelector(state => state.provider.account)
    const tokenBalances = useSelector(state => state.tokens.balances)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const transferProgress = useSelector(state => state.exchange.transferInProgress)
    const events = useSelector(state => state.exchange.events)
    //? function to handle the change of the balance inputs
    const amountHandler = (e, token) => {
        if (tokens && token == tokens[0]) {
            setToken1TransferAmount(e)
        } else if (tokens && token == tokens[1]) {
            setToken2TransferAmount(e)
        }
    }
    //? On submit function for the deposit
    const depositHandler = (e, token) => {
        e.preventDefault()
        //? Case we have the tokens address
        if (token.address === tokens[0].address) {
            //? we can make the deposit happen
            transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
                .catch(err => {
                    //? Handle the error
                    dispatch({ type: 'TRANSFER_FAIL' })
                })
            setToken1TransferAmount(0)
        } else if (token.address === tokens[1].address) {
            //? we can make the deposit happen
            transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
                .catch(err => {
                    //? Handle the error
                    dispatch({ type: 'TRANSFER_FAIL' })
                })
            setToken2TransferAmount(0)
        }
    }
    //? On submit function for the withdraw
    const withdrawHandler = (e, token) => {
        e.preventDefault()
        //? Case we have the tokens address
        if (token.address === tokens[0].address) {
            //? we can make the deposit happen
            transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
                .catch(err => {
                    //? Handle the error
                    dispatch({ type: 'TRANSFER_FAIL' })
                })
            setToken1TransferAmount(0)
        } else if (token.address === tokens[1].address) {
            //? we can make the deposit happen
            transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
                .catch(err => {
                    //? Handle the error
                    dispatch({ type: 'TRANSFER_FAIL' })
                })
            setToken2TransferAmount(0)

        }
    }
    useEffect(() => {
        if (exchange && tokens[0] && tokens[1] && account) {
            loadBalances(exchange, tokens, account, dispatch)
        }
    },
        //? CASE ANY OF THIS VARIABLES CHANGE, IT CALL THE USE EFFECT AGAIN
        [exchange, tokens, account, transferProgress, events])

    const tabHandler = (e) => {
        if (e.target.className !== depositRef.current.className) {
            e.target.className = ' tab tab--active '
            depositRef.current.className = 'tab'
            setIsDeposit(false)
        } else {
            e.target.className = ' tab tab--active '
            WithdrawRef.current.className = 'tab'
            setIsDeposit(true)
        }
    }

    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
                    <button onClick={tabHandler} ref={WithdrawRef} className='tab'>Withdraw</button>
                </div>
            </div>

            {/* Deposit/Withdraw Component 1 (DApp) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br /><img src={dapp} alt="Token logo" />{symbols && symbols[0]}</p>
                    <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
                    <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
                </div>

                <form onSubmit={(e) => { isDeposit ? depositHandler(e, tokens[0]) : withdrawHandler(e, tokens[0]) }}>
                    <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
                    <input
                        value={token1TransferAmount}
                        type="text" id='token0' placeholder='0.0000' onChange={(e) => amountHandler(e.target.value, tokens[0])} />

                    <button className='button'>
                        <span>{isDeposit ? 'Deposit' : 'Withdraw'}</span>
                    </button>
                </form>
            </div>

            <hr />

            {/* Deposit/Withdraw Component 2 (mETH) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br /><img src={eth} alt="Token logo" />{symbols && symbols[1]}</p>
                    <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
                    <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
                </div>

                <form onSubmit={(e) => { isDeposit ? depositHandler(e, tokens[1]) : withdrawHandler(e, tokens[1]) }}>
                    <label htmlFor="token1"></label>
                    <input
                        type="text"
                        id='token1'
                        value={token2TransferAmount}
                        placeholder='0.0000'
                        onChange={(e) => { amountHandler(e.target.value, tokens[1]) }}
                    />

                    <button className='button' type='submit'>
                        <span>{isDeposit ? 'Deposit' : 'Withdraw'}</span>
                    </button>
                </form>
            </div>

            <hr />
        </div>
    );
}

export default Balance;
