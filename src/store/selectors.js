import { createSelector } from 'reselect'
import { get, groupBy } from 'lodash'
import moment from 'moment'
import {ethers} from 'ethers'
//? High level of accessing variables using loadash
const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const GREEN = '#25CE8F'
const RED = 'F45353'
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
    allOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data
        orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
        orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)
        orders = decorateOrderBookOrders(orders, tokens)
        orders = groupBy(orders,'orderType')
        console.log(orders)
    }
)

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return (order)
        })
    )
}


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