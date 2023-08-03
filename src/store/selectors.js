import { createSelector } from 'reselect'
import { get, groupBy,reject } from 'lodash'
import moment from 'moment'
import {ethers} from 'ethers'
//? High level of accessing variables using loadash
const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const GREEN = '#25CE8F'
const RED = '#F45353'
const cancelledOrders = state => get(state,'exchange.cancelledOrders.data',[])
const filledOrders = state => get(state,'exchange.filledOrders.data',[])
//? function to get only the open orders, removing the filled and cancelled ones
const openOrders = state =>{
    //? Grab all the data
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = filledOrders(state)
    //? reject filled and cancelled
    const openOrders = reject(all,(order)=>{
        const orderFilled = filled.some((o)=>o._id.toString()===order._id.toString())
        const orderCancelled = cancelled.some((o)=>o._id.toString()===order._id.toString())
        return(orderFilled || orderCancelled)
    })
    return openOrders
}
//? decoration for decoding hex values to normal values
const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount
    if (order._tokenGive == tokens[1].address) {
        token0Amount = order._amountGive
        token1Amount = order._amountGet
    } else {
        token0Amount = order._amountGet
        token1Amount = order._amountGive
    }
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * 100000) / 100000
    return ({
        ...order,
        token1Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token2Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

//? Order book selector is to filter the orders
export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data
        orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
        orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)
        orders = decorateOrderBookOrders(orders, tokens)
        orders = groupBy(orders,'orderType')
        //? sort orders by token price
        const buyOrders = get(orders,'buy',[])
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a,b)=>b.tokenPrice-a.tokenPrice)
        }
        //? sort sell orders by token price
        const sellOrders = get(orders,'sell',[])
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a,b)=>b.tokenPrice-a.tokenPrice)
        }
        console.log(orders)
        return orders
    }
)
//? Spread to a decoration of the book order to put information relative to the nature of the order
//? or to the decoration involving putting decoded values
const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return (order)
        })
    )
}

//? decoration to put the nature of the order
const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order._tokenGive === tokens[1].address ? 'buy' : 'sell'
    return (
        {
            ...order,
            orderType,
            orderTypeClass: (orderType==='buy'?GREEN:RED),
            orderFillAction: (orderType === 'buy'?'sell':'buy')
        }
    )
}