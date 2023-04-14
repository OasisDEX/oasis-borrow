import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useMemo, useReducer } from 'react'

import { useWeb3OnBoardConnectorContext } from './web3OnBoardConnectorProvider'

export function useWeb3OnBoardConnection({ walletConnect }: { walletConnect: boolean }) {
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { connect, networkConnect } = useWeb3OnBoardConnectorContext()
  const [autoConnectState, dispatchAutoConnect] = useReducer(
    (state: { count: number }) => {
      return { count: state.count + 1 }
    },
    { count: 0 },
  )

  const connected = useMemo(() => {
    if (!walletConnect) {
      if (autoConnectState.count < 4) {
        return false
      }
      return web3Context?.status === 'connectedReadonly' || web3Context?.status === 'connected'
    }
    return web3Context?.status === 'connected'
  }, [walletConnect, web3Context?.status, autoConnectState])

  const connectingMemo = useMemo(() => {
    return web3Context === undefined || web3Context.status === 'connecting'
  }, [web3Context])

  const executeConnection = useCallback(
    async (onConnect?: (account?: string) => void) => {
      let account: string | undefined
      if (walletConnect) {
        account = await connect()
      } else {
        account = await connect(true)
        dispatchAutoConnect()
        if (!account) {
          await networkConnect()
        }
      }
      onConnect?.(account)
    },
    [walletConnect, connect, networkConnect],
  )

  return {
    executeConnection,
    connected,
    connecting: connectingMemo,
  }
}
