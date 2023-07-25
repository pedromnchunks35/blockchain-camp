import dapp from '../assets/dapp.svg'
import { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import { loadBalances } from '../store/iteractions';
import { useDispatch } from 'react-redux';

const Balance = () => {
    const [token1TransferAmount,setToken1TransferAmount] = useState(0)
    const dispatch = useDispatch()
    const symbols = useSelector(state => state.tokens.symbols)
    const exchange = useSelector(state => state.exchange.contract)
    const tokens = useSelector(state => state.tokens.contracts)
    const account = useSelector(state => state.provider.account)
    const tokenBalances = useSelector(state=>state.tokens.balances)
    //? function to handle the change of the balance inputs
    const amountHandler = (e,token) =>{
        if(token.address == tokens[0].address){
            setToken1TransferAmount(e.target.value)
        }
    }
    //? On submit function for the deposit
    const depositHandler = (e,token) =>{
        e.preventDefault()
        if(token.address === tokens[0].address){

        }
    }
    useEffect(() => {
        if (exchange && tokens[0] && tokens[1] && account) {
            loadBalances(exchange, tokens, account, dispatch)
        }
    },[exchange,tokens,account])
    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button className='tab tab--active'>Deposit</button>
                    <button className='tab'>Withdraw</button>
                </div>
            </div>

            {/* Deposit/Withdraw Component 1 (DApp) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br/><img src={dapp} alt="Token logo"/>{symbols && symbols[0]}</p>
                    <p><small>Wallet</small><br/>{tokenBalances && tokenBalances[0]}</p>
                    <p><small>Exchange</small><br/>{tokenBalances && tokenBalances[2]}</p>
                </div>

                <form onSubmit={depositHandler(e,tokens[0])}>
                    <label htmlFor="token0">{symbols&&symbols[0]} Amount</label>
                    <input type="text" id='token0' placeholder='0.0000' onChange={(e)=>amountHandler(e.target.value)} />

                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
            </div>

            <hr />

            {/* Deposit/Withdraw Component 2 (mETH) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>

                </div>

                <form>
                    <label htmlFor="token1"></label>
                    <input type="text" id='token1' placeholder='0.0000' />

                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
            </div>

            <hr />
        </div>
    );
}

export default Balance;
