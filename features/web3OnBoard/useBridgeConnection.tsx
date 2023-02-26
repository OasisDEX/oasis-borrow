import { useAppContext } from 'components/AppContextProvider'
import { useAsyncEffect } from 'helpers/hooks/useAsyncEffect'
import { useObservable } from 'helpers/observableHook'
import { useEffect } from 'react'

import { BridgeConnector } from './BridgeConnector'
import { useBridgeConnector } from './useBridgeConnector'

export function useBridgeConnection() {
  const bridgeConnector: BridgeConnector | undefined = useBridgeConnector()
  const { web3Context$ } = useAppContext()
  const [web3Context, web3Error] = useObservable(web3Context$)

  useEffect(() => {
    if (web3Error) {
      console.error(web3Error)
    }
  }, [web3Error])

  const { error } = useAsyncEffect(
    async () => {
      if (!bridgeConnector && web3Context?.status === 'connected') {
        console.log(`Bridge connector is not available, disconnecting...`)
        web3Context.deactivate()
        return
      }

      if (bridgeConnector && web3Context?.status === 'connectedReadonly') {
        console.log(`Bridge connector is available but connected readonly, disconnecting...`)
        web3Context.deactivate()
        return
      }
      if (
        bridgeConnector &&
        (web3Context?.status === 'error' ||
          web3Context?.status === 'notConnected' ||
          web3Context?.status === 'connectedReadonly')
      ) {
        console.log(`Connecting to bridge connector...`)
        try {
          await web3Context.connect(bridgeConnector, bridgeConnector.connectionKind)
        } catch (error) {
          console.error(error)
        }
      }
    },
    () => Promise.resolve(),
    [bridgeConnector, web3Context],
  )

  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])
}
