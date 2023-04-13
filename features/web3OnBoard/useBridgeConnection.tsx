import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { isConnectable } from 'features/web3Context/types'
import { useObservable } from 'helpers/observableHook'
import { useCallback, useState } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const [autoConnector, createBridgeConnector] = useBridgeConnector()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)
  const [connector, setConnector] = useState<BridgeConnector | undefined>(undefined)

  const connect = useCallback(
    async (autoConnect: boolean = false) => {
      const bridgeConnector =
        autoConnector || (autoConnect ? undefined : await createBridgeConnector())

      setConnector(bridgeConnector)
      if (
        bridgeConnector &&
        isConnectable(web3Context) &&
        web3Context &&
        connector?.isTheSame(bridgeConnector)
      ) {
        try {
          await web3Context.connect(connector, connector.connectionKind)
          return getAddress(connector.wallet.accounts[0].address)
        } catch (error) {
          console.error(error)
        }
      }
      return undefined
    },
    [autoConnector, connector, createBridgeConnector, web3Context],
  )

  const autoConnect = useCallback(() => connect(true), [connect])

  return { connect, autoConnect }
}
