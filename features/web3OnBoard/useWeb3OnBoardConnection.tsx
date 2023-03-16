import { useConnectWallet } from '@web3-onboard/react'
import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo } from 'react'

import { useBridgeConnection } from './useBridgeConnection'
import { useNetworkConnection } from './useNetworkConnection'

export function useWeb3OnBoardConnection({ walletConnect }: { walletConnect: boolean }) {
  const [{ wallet, connecting }, connect] = useConnectWallet()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  useBridgeConnection()
  const { networkConnect } = useNetworkConnection()

  const connected = useMemo(() => {
    if (!walletConnect) {
      return (
        (web3Context?.status === 'connectedReadonly' || web3Context?.status === 'connected') &&
        web3Context.connectionKind === 'network'
      )
    }
    return web3Context?.status === 'connected' && wallet !== undefined
  }, [wallet, web3Context, walletConnect])

  const connectingMemo = useMemo(() => {
    return web3Context === undefined || web3Context.status === 'connecting' || connecting
  }, [web3Context, connecting])

  const executeConnection = useCallback(() => {
    if (connecting || connected) return
    if (walletConnect) {
      void connect()
    } else {
      void networkConnect()
    }
  }, [networkConnect, connect, connected, connecting, walletConnect])

  return { executeConnection, connected, connecting: connectingMemo }
}
