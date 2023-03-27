import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useEffect } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const createBridgeConnector = useBridgeConnector()
  const [{ wallet }] = useConnectWallet()
  const [{ chains }] = useSetChain()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const walletIsNotConnected =
    web3Context?.status === 'error' ||
    web3Context?.status === 'notConnected' ||
    web3Context?.status === 'connectedReadonly'

  useEffect(() => {
    async function autoConnect() {
      if (walletIsNotConnected && wallet?.accounts.length && chains.length) {
        const bridgeConnector = new BridgeConnector(wallet, chains)
        await web3Context.connect(bridgeConnector!, bridgeConnector!.connectionKind)
      }
    }
    void autoConnect()
  }, [createBridgeConnector, wallet, walletIsNotConnected, web3Context, chains])

  const connect = useCallback(async () => {
    const bridgeConnector = await createBridgeConnector()
    if (bridgeConnector && walletIsNotConnected) {
      try {
        await web3Context.connect(bridgeConnector, bridgeConnector.connectionKind)
      } catch (error) {
        console.error(error)
      }
    }
  }, [createBridgeConnector, walletIsNotConnected, web3Context])

  return { connect }
}
