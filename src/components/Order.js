import { useEffect, useRef, useState } from "react";
import { loadAllOrders, makeBuyOrder, makeSellerOrder } from "../store/iteractions";
import { useDispatch, useSelector } from "react-redux";

const Order = () => {
    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0)
    const buyRef = useRef(null)
    const sellRef = useRef(null)
    const provider = useSelector(state => state.provider.connection)
    const events = useSelector(state => state.exchange.events)
    const tokens = useSelector(state => state.tokens.contracts)
    const exchange = useSelector(state => state.exchange.contract)
    const dispatch = useDispatch()
    const tabHandler = (e) => {
        if (e.target.className !== buyRef.current.className) {
            e.target.className = 'tab tab--active'
            buyRef.current.className = 'tab'
            setIsBuy(false)
        } else {
            e.target.className = 'tab tab--active'
            sellRef.current.className = 'tab'
            setIsBuy(true)
        }
    }

    useEffect(() => {
        loadAllOrders(provider, exchange, dispatch)
    }, [events])

    //? Purchase handler
    const buyHandler = (e) => {
        e.preventDefault()
        makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }
    //? Selling handler 
    const sellHandler = (e) => {
        e.preventDefault()
        makeSellerOrder(provider, exchange, tokens, { amount, price }, dispatch)
        setAmount(0)
        setPrice(0)
    }
    return (
        <div className="component exchange__orders">
            <div className='component__header flex-between'>
                <h2>New Order</h2>
                <div className='tabs'>
                    <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
                    <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
                </div>
            </div>

            <form onSubmit={isBuy ? buyHandler : sellHandler}>
                {isBuy ?
                    (<label htmlFor="amount">Buy Amount</label>) :
                    (<label htmlFor="sell">Sell Amount</label>)
                }
                <input
                    value={amount === 0 ? "" : amount}
                    type="text" id='amount'
                    placeholder='0.0000'
                    onChange={(e) => setAmount(e.target.value)} />
                {isBuy ?
                    (<label htmlFor="amount">Buy Price</label>) :
                    (<label htmlFor="sell">Sell Price</label>)
                }
                <input
                    value={price === 0 ? "" : price}
                    type="text"
                    id='price'
                    placeholder='0.0000'
                    onChange={(e) => setPrice(e.target.value)} />

                <button className='button button--filled' type='submit'>
                    {isBuy ? (<span>Buy</span>) : (<span>Sell</span>)}
                </button>
            </form>
        </div>
    );
}

export default Order;