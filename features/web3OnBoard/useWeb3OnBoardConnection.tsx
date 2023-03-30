import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { useAppContext } from 'components/AppContextProvider'
import { useCustomNetworkParameter } from 'helpers/getCustomNetworkParameter'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useEffect, useMemo } from 'react'

import { useBridgeConnection } from './useBridgeConnection'
import { useNetworkConnection } from './useNetworkConnection'

export function useWeb3OnBoardConnection({ walletConnect }: { walletConnect: boolean }) {
  const [{ wallet }] = useConnectWallet()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const { connect } = useBridgeConnection()
  const [, setChain] = useSetChain()
  const { networkConnect } = useNetworkConnection()
  const [customNetwork] = useCustomNetworkParameter()

  const connected = useMemo(() => {
    if (!walletConnect) {
      return web3Context?.status === 'connectedReadonly' || web3Context?.status === 'connected'
    }
    return web3Context?.status === 'connected'
  }, [web3Context, walletConnect])

  const connectingMemo = useMemo(() => {
    return web3Context === undefined || web3Context.status === 'connecting'
  }, [web3Context])

  const executeConnection = useCallback(
    async (onConnect?: (account?: string) => void) => {
      let account: string | undefined = undefined
      if (walletConnect) {
        account = await connect()
      } else {
        await networkConnect()
      }
      onConnect?.(account)
    },
    [walletConnect, connect, networkConnect],
  )

  useEffect(() => {
    if (wallet && walletConnect && customNetwork?.id !== '1' && customNetwork?.hexId) {
      void setChain({ chainId: customNetwork.hexId }).then(console.log).catch(console.error)
    }
  }, [wallet, walletConnect, customNetwork, setChain, connected])

  return { executeConnection, connected, connecting: connectingMemo }
}
