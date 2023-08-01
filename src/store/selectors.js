import { createSelector } from 'reselect'
import { get } from 'lodash'
//? High level of accessing variables using loadash
const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])

//? Order book selector is to filter the orders
export const orderBookSelector = createSelector(
    allOrders,
    tokens,
    (orders, tokens) => {
        //? Filter the data
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
    }
)