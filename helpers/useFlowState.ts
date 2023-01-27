import { useAppContext } from 'components/AppContextProvider'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { useEffect, useState } from 'react'

import { setupDpmContext } from './dummyStateMachine'

type useFlowStateProps = {
  onProxyReady?: (onProxyReady: string) => void
}

export function useFlowState({ onProxyReady }: useFlowStateProps) {
  const [isConnected, setIsConnected] = useState<boolean>()
  const [freeProxyAddress, setFreeProxyAddress] = useState<string>()
  const { dpmAccountStateMachine, unconsumedDpmProxyForConnectedAccount$ } = useAaveContext()
  const { context$ } = useAppContext()
  const { stateMachine } = setupDpmContext(dpmAccountStateMachine)

  function updateProxyValues(proxy: string) {
    setFreeProxyAddress(proxy)
    typeof onProxyReady === 'function' && onProxyReady(proxy)
  }

  useEffect(() => {
    const walletConnectionSubscription = context$.subscribe(({ status }) => {
      setIsConnected(status === 'connected')
    })
    const proxyMachineSubscription = stateMachine.subscribe((state) => {
      if (
        state.value === 'txSuccess' &&
        state.context.result?.proxy &&
        freeProxyAddress !== state.context.result?.proxy
      ) {
        // new proxy created
        updateProxyValues(state.context.result.proxy)
      }
    })
    const currentFreeProxySubscription = unconsumedDpmProxyForConnectedAccount$.subscribe(
      (...data) => {
        console.log('data', data)
        return
        // unused proxy found
        if (data?.proxy) {
          updateProxyValues(data?.proxy)
        }
      },
    )
    return () => {
      proxyMachineSubscription.unsubscribe()
      walletConnectionSubscription.unsubscribe()
      currentFreeProxySubscription.unsubscribe()
    }
  }, [])

  return {
    dpmMachine: stateMachine,
    freeProxyAddress,
    isConnected,
  }
}
