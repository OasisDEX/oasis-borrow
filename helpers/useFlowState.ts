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
type FinalCallbackType = (params: {
  availableProxies: UserFlowStateReturnType['availableProxies']
  walletAddress: UserFlowStateReturnType['walletAddress']
  amount: UserFlowStateReturnType['amount']
  token: UserFlowStateReturnType['token']
  isProxyReady: UserFlowStateReturnType['isProxyReady']
  isWalletConnected: UserFlowStateReturnType['isWalletConnected']
  isAllowanceReady: UserFlowStateReturnType['isAllowanceReady']
}) => void

type UseFlowStateProps = {
  amount?: BigNumber
  token?: string
  existingProxy?: string
  onEverythingReady?: FinalCallbackType
}

export function useFlowState({
  amount,
  token,
  onEverythingReady,
  existingProxy,
}: UseFlowStateProps) {
  const [isWalletConnected, setWalletConnected] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [userProxyList, setUserProxyList] = useState<UserDpmAccount[]>([])
  const [availableProxies, setAvailableProxies] = useState<string[]>(
    existingProxy ? [existingProxy] : [],
  )
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

  const isProxyReady = !!availableProxies.length

  // wallet connection + DPM proxy machine
  useEffect(() => {
    const walletConnectionSubscription = context$.subscribe(({ status, account }) => {
      setWalletConnected(status === 'connected')
      status === 'connected' && account && setWalletAddress(account)
    })
    if (existingProxy) {
      return () => {
        walletConnectionSubscription.unsubscribe()
      }
    }
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
    if (!walletAddress || !userProxyList.length || existingProxy) return
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
    if (!isProxyReady || !allDefined(walletAddress, amount, token)) return
    if (token === 'ETH') {
      setLoading(false)
      setAllowanceReady(true)
      return
    }
    const spender = availableProxies[0] // probably needs further thoguht
    allowanceMachine.send('SET_ALLOWANCE_CONTEXT', {
      minimumAmount: amount,
      allowanceType: 'unlimited',
      token,
      spender,
    })
    const allowanceSubscription = allowanceForAccount$(token!, spender).subscribe(
      (allowanceData) => {
        if (allowanceData) {
          setLoading(false)
          if (allowanceData.gt(zero) && allowanceData.gte(amount!)) {
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
        isProxyReady,
        isWalletConnected,
        isAllowanceReady,
      })
    }
  }, [isAllowanceReady, availableProxies, amount])

  useEffect(() => {
    if (isProxyReady && allDefined(amount, token)) {
      setLoading(true)
    }
  }, [amount])

  return {
    dpmMachine,
    allowanceMachine,
    availableProxies,
    walletAddress,
    amount,
    token,
    isProxyReady,
    isWalletConnected,
    isAllowanceReady,
    isLoading, // just for the allowance loading state
    isEverythingReady: isAllowanceReady, // just for convenience, allowance is always the last step
  }
}
