import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo, useRef } from 'react'

import { useBridgeConnection } from './useBridgeConnection'
import { useNetworkConnection } from './useNetworkConnection'

export function useWeb3OnBoardConnection({ walletConnect }: { walletConnect: boolean }) {
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { connect } = useBridgeConnection()
  const { networkConnect } = useNetworkConnection()

  const lockAutoConnect = useRef<boolean>(false)

  const connected = useMemo(() => {
    if (!walletConnect) {
      return web3Context?.status === 'connectedReadonly' || web3Context?.status === 'connected'
    }
    return web3Context?.status === 'connected'
  }, [web3Context, walletConnect])

  const connectingMemo = useMemo(() => {
    return (
      web3Context === undefined || web3Context.status === 'connecting' || lockAutoConnect.current
    )
  }, [web3Context])

  const executeConnection = useCallback(
    async (onConnect?: (account?: string) => void) => {
      lockAutoConnect.current = true
      let account: string | undefined = undefined
      if (walletConnect) {
        account = await connect()
      } else {
        await networkConnect()
      }
      onConnect?.(account)

      lockAutoConnect.current = false
    },
    [walletConnect, connect, networkConnect],
  )

  const executeAutoConnect = useCallback(async () => {
    if (!lockAutoConnect.current) {
      return await connect(true)
    }
    return undefined
  }, [connect])

  return {
    executeConnection,
    connected,
    connecting: connectingMemo,
    autoConnect: executeAutoConnect,
  }
}
