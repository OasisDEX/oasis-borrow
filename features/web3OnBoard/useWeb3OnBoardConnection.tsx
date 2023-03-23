import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo } from 'react'

import { useBridgeConnection } from './useBridgeConnection'
import { useNetworkConnection } from './useNetworkConnection'

export function useWeb3OnBoardConnection({ walletConnect }: { walletConnect: boolean }) {
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { connect } = useBridgeConnection()
  const { networkConnect } = useNetworkConnection()

  const connected = useMemo(() => {
    if (!walletConnect) {
      return web3Context?.status === 'connectedReadonly' || web3Context?.status === 'connected'
    }
    return web3Context?.status === 'connected'
  }, [web3Context, walletConnect])

  const connectingMemo = useMemo(() => {
    return web3Context === undefined || web3Context.status === 'connecting'
  }, [web3Context])

  const executeConnection = useCallback(async () => {
    if (walletConnect) {
      await connect()
    } else {
      await networkConnect()
    }
  }, [networkConnect, connect, walletConnect])

  return { executeConnection, connected, connecting: connectingMemo }
}
