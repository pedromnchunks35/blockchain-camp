import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies'
import config from '../config.json'
import { loadAccount } from '../store/iteractions';
//? The Navbar component, here we can see our wallet address,
//? balance and even change network
const Navbar = () => {
    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)
    const chainId = useSelector(state => state.provider.chainId)

    const dispatch = useDispatch()
    //? for the account connection
    const connectHandler = async () => {
        //? Get the accounts and also get the balance
        await loadAccount(provider, dispatch)
    }
    //? For the network selection
    const networkHandler = async (e) => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }],
        })
    }

    return (
        <div className='exchange__header grid'>
            <div className='exchange__header--brand flex'>
                <img src={logo} className="logo" alt="DApp Logo"></img>
                <h1>DApp Token Exchange</h1>
            </div>

            <div className='exchange__header--networks flex'>
                <img src={eth} alt="ETH Logo" className='Eth Logo' />

                {chainId && (
                    <select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
                        <option value="0" disabled>Select Network</option>
                        <option value="0x7A69">Localhost</option>
                        <option value="0x2a">Kovan</option>
                    </select>
                )}

            </div>

            <div className='exchange__header--account flex'>
                {balance ? (
                    <p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
                ) : (
                    <p><small>My Balance</small>0 ETH</p>
                )}
                {account ? (
                    <a
                        href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
                        target='_blank'
                        rel='noreferrer'
                    >
                        {account.slice(0, 5) + '...' + account.slice(38, 42)}
                        <Blockies
                            seed={account}
                            size={10}
                            scale={3}
                            color="#2187D0"
                            bgColor="#F1F2F9"
                            spotColor="#767F92"
                            className="identicon"
                        />
                    </a>
                ) : (
                    <button className="button" onClick={connectHandler}>Connect</button>
                )}
            </div>
        </div>
    )
}

export default Navbar;
