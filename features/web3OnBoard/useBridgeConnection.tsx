import { useAppContext } from 'components/AppContextProvider'
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
      } catch (error) {
        console.error(error)
      }
    }
  }, [createBridgeConnector, web3NotConnected, web3Context])

  return { connect }
}
