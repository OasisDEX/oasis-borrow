import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { useObservable } from 'helpers/observableHook'
import { useCallback } from 'react'

import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const createBridgeConnector = useBridgeConnector()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)

  const connect = useCallback(async () => {
    const bridgeConnector = await createBridgeConnector()
    if (
      bridgeConnector &&
      (web3Context?.status === 'error' ||
        web3Context?.status === 'notConnected' ||
        web3Context?.status === 'connectedReadonly')
    ) {
      try {
        await web3Context.connect(bridgeConnector, bridgeConnector.connectionKind)
        return getAddress(bridgeConnector.wallet.accounts[0].address)
      } catch (error) {
        console.error(error)
      }
    }
    return undefined
  }, [createBridgeConnector, web3Context])

  return { connect }
}
