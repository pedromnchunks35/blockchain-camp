import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { myEventsSelector } from "../store/selectors"
import config from "../config.json"
const Alert = () => {
    const alertRef = useRef(null)
    const isPending = useSelector(state => state.exchange.transaction.isPending)
    const isError = useSelector(state => state.exchange.transaction.isError)
    const account = useSelector(state => state.provider.account)
    const myEvents = useSelector(myEventsSelector)
    const network = useSelector(state => state.provider.chainID)
    const removeHandler = async (e) => {
        alertRef.current.className = 'alert alert--remove'
    }
    useEffect(() => {
        if ((isPending || isError || myEvents[0]) && account) {
            alertRef.current.className = 'alert'
        }
    }, [isError, isPending, account, myEvents])
    return (
        <div>
            {
                isPending ?
                    (
                        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                            <h1>Transaction Pending...</h1>
                        </div>
                    )
                    :
                    isError ?
                        (
                            <div className="alert alert--remove">
                                <h1>Transaction Will Fail</h1>
                            </div>
                        )
                        :
                        !isPending && myEvents[0] ? (
                            <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                                <h1>Transaction Successful</h1>
                                <a
                                    href={config[network] ? `${config[network].explorerURL}/tx/${myEvents[0].transactionHash}` : `https://etherscan.io/tx/${myEvents[0].transactionHash}`}
                                    target='_blank'
                                    rel='noreferrer'
                                >
                                    {
                                        myEvents[0].transactionHash.slice(0, 6) + "..." + myEvents[0].transactionHash.slice(60, 66)
                                    }
                                </a>
                            </div>
                        )
                            :
                            (
                                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>

                                </div>
                            )
            }
        </div>
    );
}

export default Alert;
