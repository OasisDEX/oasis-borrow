import BigNumber from 'bignumber.js'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import { allDefined } from './allDefined'
import { setupAllowanceContext, setupDpmContext } from './dummyStateMachine'

type UseFlowStateProps = {
  amount?: BigNumber
  token?: string
}

export function useFlowState({ amount, token }: UseFlowStateProps) {
  const [isWalletConnected, setWalletConnected] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [userProxyList, setUserProxyList] = useState<UserDpmAccount[]>([])
  const [availableProxies, setAvailableProxies] = useState<string[]>([])
  const {
    dpmAccountStateMachine,
    allowanceStateMachine,
    userDpmProxies$,
    proxyConsumed$,
  } = useAppContext()
  const { context$ } = useAppContext()
  const { stateMachine: dpmMachine } = setupDpmContext(dpmAccountStateMachine)
  const { stateMachine: allowanceMachine } = setupAllowanceContext(allowanceStateMachine)

  useEffect(() => {
    // wallet connection
    const walletConnectionSubscription = context$.subscribe(({ status, account }) => {
      setWalletConnected(status === 'connected')
      status === 'connected' && account && setWalletAddress(account)
    })
    const proxyMachineSubscription = dpmMachine.subscribe((state) => {
      if (
        state.value === 'txSuccess' &&
        state.context.result?.proxy &&
        !availableProxies?.includes(state.context.result?.proxy)
      ) {
        setAvailableProxies([...(availableProxies || []), state.context.result.proxy])
      }
    })
    return () => {
      walletConnectionSubscription.unsubscribe()
      proxyMachineSubscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // list of (all) DPM proxies
    if (!walletAddress) return
    const userDpmProxies = userDpmProxies$(walletAddress).subscribe((userProxyList) => {
      setUserProxyList(userProxyList)
    })
    return () => {
      userDpmProxies.unsubscribe()
    }
  }, [walletAddress])

  useEffect(() => {
    // list of available DPM proxies (updated asynchronously)
    if (!walletAddress || !userProxyList.length) return
    const proxyListAvailabilityMap = combineLatest(
      userProxyList.map((proxy) =>
        proxyConsumed$(proxy.proxy).pipe(
          map((hasOpenedPosition) => {
            return { ...proxy, hasOpenedPosition }
          }),
        ),
      ),
    ).subscribe((availableProxies) => {
      setAvailableProxies(
        availableProxies
          .filter(({ hasOpenedPosition }) => !hasOpenedPosition)
          .map(({ proxy }) => proxy),
      )
    })
    return () => {
      proxyListAvailabilityMap.unsubscribe()
    }
  }, [walletAddress, userProxyList])

  useEffect(() => {
    // allowance handling
    if (!availableProxies.length || !allDefined(walletAddress, amount, token)) return
    console.log('allowance handling', { walletAddress, availableProxies, amount, token })
    const allowanceMachineSubscription = allowanceMachine.subscribe((state) => {
      console.log('allowanceMachineSubscription state', state)
    })
    return () => {
      allowanceMachineSubscription.unsubscribe()
    }
  }, [walletAddress, availableProxies, amount, token])

  const debug = {
    dpmMachine,
    allowanceMachine,
    availableProxies,
    needsNewProxy: !availableProxies.length,
    isWalletConnected,
    walletAddress,
    amount,
    token,
  }

  // console.log('useFlowState debug', debug)

  return debug
}
