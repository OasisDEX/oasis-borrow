import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { Web3ContextConnectedReadonly } from 'features/web3Context'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo } from 'react'

import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const createBridgeConnector = useBridgeConnector()
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
    if (bridgeConnector && web3NotConnected) {
      try {
        await (web3Context as Web3ContextConnectedReadonly).connect(
          bridgeConnector,
          bridgeConnector.connectionKind,
        )
        return getAddress(bridgeConnector.wallet.accounts[0].address)
      } catch (error) {
        console.error(error)
      }
    }
    return undefined
  }, [createBridgeConnector, web3Context, web3NotConnected])

  return { connect }
}
