import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { isConnectable } from 'features/web3Context/types'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo } from 'react'

import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const [autoConnector, createBridgeConnector] = useBridgeConnector()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const web3NotConnected = useMemo(() => {
    return (
      web3Context?.status === 'error' ||
      web3Context?.status === 'notConnected' ||
      web3Context?.status === 'connectedReadonly'
    )
  }, [web3Context?.status])

  const connect = useCallback(async () => {
    const bridgeConnector = await createBridgeConnector()
    if (bridgeConnector && web3NotConnected && isConnectable(web3Context)) {
      try {
        await web3Context.connect(bridgeConnector, bridgeConnector.connectionKind)
        return getAddress(bridgeConnector.wallet.accounts[0].address)
      } catch (error) {
        console.error(error)
      }
    }
    return undefined
  }, [createBridgeConnector, web3Context, web3NotConnected])

  const autoConnect = useCallback(async () => {
    if (autoConnector && web3NotConnected && isConnectable(web3Context)) {
      try {
        await web3Context.connect(autoConnector, autoConnector.connectionKind)
        return getAddress(autoConnector.wallet.accounts[0].address)
      } catch (error) {
        console.error(error)
      }
    }
    return undefined
  }, [autoConnector, web3Context, web3NotConnected])

  return { connect, autoConnect }
}
