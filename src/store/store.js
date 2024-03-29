import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

//? Import reducers
import { provider,tokens,exchange } from './reducers'

//? Combine the reducers
const reducer = combineReducers({
    tokens,
    provider,
    exchange
})

const intitialState = {}

const middleware = [thunk]

const store = createStore(
    reducer,
    intitialState,
    composeWithDevTools(
        applyMiddleware(...middleware)
    )
)

export default store