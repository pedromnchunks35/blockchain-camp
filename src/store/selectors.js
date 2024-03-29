import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import moment from 'moment'
import { ethers } from 'ethers'
//? High level of accessing variables using loadash
const tokens = state => get(state, 'tokens.contracts')
const account = state => get(state, 'provider.account')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const events = state => get(state, 'exchange.events')
const GREEN = '#25CE8F'
const RED = '#F45353'
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])


export const myEventsSelector = createSelector(
    account,
    events,
    (acount, events) => {
        events = events.filter((e) => e.args._creator === acount)
        return events
    }
)

//? function to get only the open orders, removing the filled and cancelled ones
const openOrders = state => {
    //? Grab all the data
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)
    //? reject filled and cancelled
    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o._id.toString() === order._id.toString())
        const orderCancelled = cancelled.some((o) => o._id.toString() === order._id.toString())
        return (orderFilled || orderCancelled)
    })
    return openOrders
}
//? decoration for decoding hex values to normal values
const decorateOrder = (order, tokens) => {
    let token1Amount, token2Amount, tokenPrice
    if (order._token_creator_is_giving === tokens[0].address) {
        token1Amount = order._amount_token_cg
        token2Amount = order._amount_token_cw
        tokenPrice = token1Amount / token2Amount
    } else {
        token1Amount = order._amount_token_cw
        token2Amount = order._amount_token_cg
        tokenPrice = token1Amount / token2Amount
    }
    tokenPrice = Math.round(tokenPrice * 100000) / 100000
    return ({
        ...order,
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        token2Amount: ethers.utils.formatUnits(token2Amount, "ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order._timestamp).format('h:mm:ssa d MMM D')
    })
}

//? Order book selector is to filter the orders
export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data
        orders = orders.filter((o) => o._token_creator_wants === tokens[0].address || o._token_creator_wants === tokens[1].address)
        orders = orders.filter((o) => o._token_creator_is_giving === tokens[0].address || o._token_creator_is_giving === tokens[1].address)
        orders = decorateOrderBookOrders(orders, tokens)
        orders = groupBy(orders, 'orderType')
        //? sort orders by token price
        const buyOrders = get(orders, 'buy', [])
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }
        //? sort sell orders by token price
        const sellOrders = get(orders, 'sell', [])
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }
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
    const orderType = order._token_creator_is_giving === tokens[1].address ? 'sell' : 'buy'
    return (
        {
            ...order,
            orderType,
            orderTypeClass: (orderType === 'buy' ? GREEN : RED),
            orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
        }
    )
}

//? Price chart selectors
export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data
        orders = orders.filter((o) => o._token_creator_wants === tokens[0].address || o._token_creator_wants === tokens[1].address)
        orders = orders.filter((o) => o._token_creator_is_giving === tokens[0].address || o._token_creator_is_giving === tokens[1].address)
        //? sort orders by timestamp
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        //? Decorate the orders
        orders = orders.map((o) => decorateOrder(o, tokens))
        let secoundLastOrder, lastOrder
        [secoundLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        const secoundLastPrice = get(secoundLastOrder, 'tokenPrice', 0)
        let result = (buildGraphData(orders))
        result.lastPrice = lastPrice
        result.lastPriceChange = (lastPrice >= secoundLastPrice ? "+" : "-")
        return result
    }
)

const buildGraphData = (orders) => {
    //? Order by timestamp
    orders = groupBy(orders, (o) =>
        //? Group it by day
        moment.unix(o._timestamp).startOf('hour').format()
    )
    const hours = Object.keys(orders)
    const graphData = hours.map((hour) => {
        //? Fetch all orders from current hour
        const group = orders[hour]
        //? Calculate the prices
        //? open is the first because we shorted it by timestamp
        const open = group[0]
        //? high will be the maximum price of this group
        const high = maxBy(group, "tokenPrice")
        //? low will be the lowest price of this group
        const low = minBy(group, "tokenPrice")
        //? close will be the last price of that group
        const close = group[group.length - 1]
        return ({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })

    return {
        series: [{
            data: graphData
        }]
    }
}

//? All filled orders
export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data
        orders = orders.filter((o) => o._token_creator_wants === tokens[0].address || o._token_creator_wants === tokens[1].address)
        orders = orders.filter((o) => o._token_creator_is_giving === tokens[0].address || o._token_creator_is_giving === tokens[1].address)
        //? Sort orders by date ascending
        orders = orders.sort((a, b) => a._timestamp - b._timestamp)
        //? Put order colors (decorate)
        orders = decorateFilledOrders(orders, tokens)
        //? Sort orders by time descending for UI
        orders = orders.sort((a, b) => b._timestamp - a._timestamp)
        return orders
    }
)

const decorateFilledOrders = (orders, tokens) => {
    let previousOrder = orders[0]
    return (orders.map((order) => {
        //? Decorate each individual order
        order = decorateOrder(order, tokens)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order
        return order
    }))
}

const decorateFilledOrder = (order, previousOrder) => {
    return ({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order._id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if (previousOrder._id === orderId) {
        return GREEN
    }
    if (previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}

//? my own open orders
export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data 
        orders = orders.filter((o) => o._creator === account)
        orders = orders.filter((o) => o._token_creator_wants === tokens[0].address || o._token_creator_wants === tokens[1].address)
        orders = orders.filter((o) => o._token_creator_is_giving === tokens[0].address || o._token_creator_is_giving === tokens[1].address)
        orders = decorateMyOpenOrders(orders, tokens)
        orders = orders.sort((a, b) => b._timestamp - a._timestamp)
        return orders
    }
)

//? decorate all open orders
const decorateMyOpenOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return (order)
        })
    )
}
//? decorate single order
const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order._token_creator_is_giving === tokens[1].address ? 'sell' : 'buy'
    return (
        {
            ...order,
            orderType,
            orderTypeClass: (orderType === 'buy' ? GREEN : RED)
        }
    )
}

//? My own filled orders
//? my own open orders
export const MyFilledOrdersSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }
        //? Filter the data 
        console.log(orders)
        orders = orders.filter((o) => o._creator === account || o._the_interested === account)
        orders = orders.filter((o) => o._token_creator_wants === tokens[0].address || o._token_creator_wants === tokens[1].address)
        orders = orders.filter((o) => o._token_creator_is_giving === tokens[0].address || o._token_creator_is_giving === tokens[1].address)
        orders = decorateMyFilledOrders(orders, account, tokens)
        orders = orders.sort((a, b) => b._timestamp - a._timestamp)
        return orders
    }
)

//? decorate all open orders
const decorateMyFilledOrders = (orders, account, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return (order)
        })
    )
}
//? decorate single order
const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order._creator === account
    let orderType;
    if (myOrder) {
        orderType = order.__token_creator_is_giving === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order._token_creator_is_giving === tokens[1].address ? 'sell' : 'buy'
    }
    return (
        {
            ...order,
            orderType,
            orderTypeClass: (orderType === 'buy' ? GREEN : RED),
            orderSign: (orderType === 'buy' ? "+" : "-")
        }
    )
}