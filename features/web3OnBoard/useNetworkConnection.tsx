import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useCallback } from 'react'

import { useNetworkConnector } from './useNetworkConnector'

export function useNetworkConnection() {
  const networkConnector = useNetworkConnector()
  const { web3Context$ } = useAppContext()
  const [web3Context] = useObservable(web3Context$)

  const networkConnect = useCallback(async () => {
    if (web3Context?.status === 'notConnected' && networkConnector) {
      await web3Context.connect(networkConnector, 'network')
    }
  }, [web3Context, networkConnector])

  return { networkConnect }
}
