import BigNumber from 'bignumber.js'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import { allDefined } from './allDefined'
import { setupAllowanceContext, setupDpmContext } from './dummyStateMachine'
import { zero } from './zero'

type UserFlowStateReturnType = ReturnType<typeof useFlowState>

type UseFlowStateProps = {
  amount?: BigNumber
  token?: string
  onEverythingReady?: (params: {
    availableProxies: UserFlowStateReturnType['availableProxies']
    walletAddress: UserFlowStateReturnType['walletAddress']
    amount: UserFlowStateReturnType['amount']
    token: UserFlowStateReturnType['token']
    isProxyReady: UserFlowStateReturnType['isProxyReady']
    isWalletConnected: UserFlowStateReturnType['isWalletConnected']
    isAllowanceReady: UserFlowStateReturnType['isAllowanceReady']
  }) => void
}

export function useFlowState({ amount, token, onEverythingReady }: UseFlowStateProps) {
  const [isWalletConnected, setWalletConnected] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [userProxyList, setUserProxyList] = useState<UserDpmAccount[]>([])
  const [availableProxies, setAvailableProxies] = useState<string[]>([])
  const [isAllowanceReady, setAllowanceReady] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const {
    dpmAccountStateMachine,
    allowanceStateMachine,
    userDpmProxies$,
    proxyConsumed$,
    allowanceForAccount$,
  } = useAppContext()
  const { context$ } = useAppContext()
  const { stateMachine: dpmMachine } = setupDpmContext(dpmAccountStateMachine)
  const { stateMachine: allowanceMachine } = setupAllowanceContext(allowanceStateMachine)

  // wallet connection + DPM proxy machine
  useEffect(() => {
    const walletConnectionSubscription = context$.subscribe(({ status, account }) => {
      setWalletConnected(status === 'connected')
      status === 'connected' && account && setWalletAddress(account)
    })
    const proxyMachineSubscription = dpmMachine.subscribe(({ value, context, event }) => {
      if (
        value === 'txSuccess' &&
        context.result?.proxy &&
        !availableProxies?.includes(context.result?.proxy) &&
        event.type === 'CONTINUE'
      ) {
        setAvailableProxies([...(availableProxies || []), context.result.proxy])
      }
    })
    return () => {
      walletConnectionSubscription.unsubscribe()
      proxyMachineSubscription.unsubscribe()
    }
  }, [])

  // list of (all) DPM proxies
  useEffect(() => {
    if (!walletAddress) return
    const userDpmProxies = userDpmProxies$(walletAddress).subscribe((userProxyList) => {
      setUserProxyList(userProxyList)
    })
    return () => {
      userDpmProxies.unsubscribe()
    }
  }, [walletAddress])

  // list of AVAILABLE DPM proxies (updated asynchronously)
  useEffect(() => {
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

  // allowance machine
  useEffect(() => {
    if (!availableProxies.length || !allDefined(walletAddress, amount, token)) return
    if (token === 'ETH') {
      setLoading(false)
      setAllowanceReady(true)
      return
    }
    const spender = availableProxies[0] // probably needs further thoguht
    allowanceMachine.send('SET_ALLOWANCE_CONTEXT', {
      minimumAmount: amount,
      token,
      spender,
    })
    const allowanceSubscription = allowanceForAccount$(token!, spender).subscribe(
      (allowanceData) => {
        if (allowanceData) {
          setLoading(false)
          if (allowanceData.gt(zero) && allowanceData.gt(amount!)) {
            setAllowanceReady(true)
          } else {
            setAllowanceReady(false)
          }
        }
      },
    )
    const allowanceMachineSubscription = allowanceMachine.subscribe(({ value, context, event }) => {
      if (value === 'txSuccess' && context.allowanceType && event.type === 'CONTINUE') {
        setAllowanceReady(true)
      }
    })
    return () => {
      allowanceMachineSubscription.unsubscribe()
      allowanceSubscription.unsubscribe()
    }
  }, [walletAddress, availableProxies, amount, token])

  // wrapping up
  useEffect(() => {
    if (
      isAllowanceReady &&
      amount &&
      token &&
      availableProxies.length &&
      typeof onEverythingReady === 'function'
    ) {
      onEverythingReady({
        availableProxies,
        walletAddress,
        amount,
        token,
        isProxyReady: !!availableProxies.length,
        isWalletConnected,
        isAllowanceReady,
      })
    }
  }, [isAllowanceReady, availableProxies, amount])

  useEffect(() => {
    setLoading(true)
  }, [amount])

  return {
    dpmMachine,
    allowanceMachine,
    availableProxies,
    walletAddress,
    amount,
    token,
    isProxyReady: !!availableProxies.length,
    isWalletConnected,
    isAllowanceReady,
    isLoading, // just for the allowance loading state
    isEverythingReady: isAllowanceReady, // just for convenience, allowance is always the last step
  }
}
