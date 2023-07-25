import { useDispatch, useSelector } from "react-redux";
import config from "../config.json"
import { loadTokens } from '../store/iteractions'

const Markets = () => {
    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const dispatch = useDispatch()
    const marketHandler = async (e) => {
        await loadTokens(provider, (e.target.value).split(","), dispatch)
    }
    return (
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>
            {
                chainId ? (
                    <select name="markets" id="markets" onChange={marketHandler}>
                        <option value={
                            `${config[31337].dapp.address},${config[31337].mETH.address}`
                        }>Dapp/mETH</option>
                        <option value={`${config[31337].dapp.address},${config[31337].mDAI.address}`
                    }>Dapp/mDAI</option>
                    </select>)
                    :
                    (<h1>
                        Not deployed to the network
                    </h1>)
            }

            <hr />
        </div>
    )
}

export default Markets;
