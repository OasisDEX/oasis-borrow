import BigNumber from 'bignumber.js'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { useAppContext } from 'components/AppContextProvider'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import { allDefined } from './allDefined'
import { callBackIfDefined } from './callBackIfDefined'
import { setupAllowanceContext, setupDpmContext } from './dummyStateMachine'
import { zero } from './zero'

type UseFlowStateReturnType = ReturnType<typeof useFlowState>
export type UseFlowStateCBParamsType = {
  availableProxies: UseFlowStateReturnType['availableProxies']
  walletAddress: UseFlowStateReturnType['walletAddress']
  amount: UseFlowStateReturnType['amount']
  token: UseFlowStateReturnType['token']
  isProxyReady: UseFlowStateReturnType['isProxyReady']
  isWalletConnected: UseFlowStateReturnType['isWalletConnected']
  isAllowanceReady: UseFlowStateReturnType['isAllowanceReady']
  asUserAction: boolean
}
export type UseFlowStateCBType = (params: UseFlowStateCBParamsType) => void

type UseFlowStateProps = {
  amount?: BigNumber
  token?: string
  existingProxy?: string
  onEverythingReady?: UseFlowStateCBType
  onGoBack?: UseFlowStateCBType
}

export function useFlowState({
  amount,
  token,
  existingProxy,
  onEverythingReady,
  onGoBack,
}: UseFlowStateProps) {
  const [isWalletConnected, setWalletConnected] = useState<boolean>(false)
  const [asUserAction, setAsUserAction] = useState<boolean>(false)
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
  const callbackParams = {
    availableProxies,
    walletAddress,
    amount,
    token,
    isProxyReady,
    isWalletConnected,
    isAllowanceReady,
    asUserAction,
  }

  const baseAllowanceContext = {
    minimumAmount: amount,
    allowanceType: 'unlimited',
    token,
    error: undefined,
  }
  const spender = availableProxies[0] // probably needs further thoguht

  // wallet connection + DPM proxy machine
  useEffect(() => {
    const walletConnectionSubscription = context$.subscribe(({ status, account }) => {
      setWalletConnected(status === 'connected')
      setWalletAddress(status === 'connected' && account ? account : undefined)
    })
    if (existingProxy) {
      return () => {
        walletConnectionSubscription.unsubscribe()
      }
    }
    const proxyMachineSubscription = dpmMachine.subscribe(({ value, context, event }) => {
      if (event.type === 'GO_BACK') {
        setAsUserAction(true)
        callBackIfDefined<UseFlowStateCBType, UseFlowStateCBParamsType>(callbackParams, onGoBack)
        dpmMachine.send('GAS_COST_ESTIMATION')
      }
      if (
        value === 'txSuccess' &&
        context.result?.proxy &&
        !availableProxies?.includes(context.result?.proxy) &&
        event.type === 'CONTINUE'
      ) {
        setAsUserAction(true)
        setAvailableProxies([...(availableProxies || []), context.result.proxy])
      }
    })
    return () => {
      walletConnectionSubscription.unsubscribe()
      proxyMachineSubscription.unsubscribe()
    }
  }, [onGoBack])

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

  // a case when proxy is ready and amount/token is not provided (skipping allowance)
  useEffect(() => {
    if (!isProxyReady || !allDefined(walletAddress, amount, token)) return
    if (!token || !amount || new BigNumber(amount || NaN).isNaN()) {
      setLoading(false)
      setAllowanceReady(false)
    }
  }, [token, amount?.toString(), isProxyReady])

  // allowance machine
  useEffect(() => {
    if (!isProxyReady || !allDefined(walletAddress, amount, token)) return
    if (token === 'ETH') {
      setLoading(false)
      setAllowanceReady(true)
      return
    }
    const allowanceSubscription = allowanceForAccount$(token!, spender).subscribe(
      (allowanceData) => {
        if (allowanceData && allowanceMachineSubscription) {
          setLoading(false)
          if (allowanceData.gt(zero) && allowanceData.gte(amount!)) {
            setAsUserAction(false)
            setAllowanceReady(true)
          } else {
            setAllowanceReady(false)
          }
        }
      },
    )
    const allowanceMachineSubscription = allowanceMachine.subscribe(({ value, context, event }) => {
      const inputChange =
        amount?.toString() &&
        (context.spender !== spender ||
          !context.minimumAmount?.eq(amount) ||
          context.token !== token)

      if (event.type === 'BACK') {
        !context.error &&
          callBackIfDefined<UseFlowStateCBType, UseFlowStateCBParamsType>(callbackParams, onGoBack)
        setAsUserAction(true)
        allowanceMachine.send('SET_ALLOWANCE_CONTEXT', {
          ...baseAllowanceContext,
          allowanceType: context.allowanceType,
          spender,
        })
      }
      if (token && amount?.toString() && inputChange) {
        allowanceMachine.send('SET_ALLOWANCE_CONTEXT', {
          ...baseAllowanceContext,
          spender,
        })
      }
      if (value !== 'idle') {
        // do not update isAllowanceReady in the background if user started the allowance flow in the machine
        allowanceSubscription.unsubscribe()
      }
      if (value === 'txSuccess' && context.allowanceType && event.type === 'CONTINUE') {
        setAsUserAction(true)
        setAllowanceReady(true)
        allowanceMachine.send('RESET_ALLOWANCE_CONTEXT', {
          ...baseAllowanceContext,
          spender,
        })
      }
    })
    return () => {
      allowanceMachineSubscription.unsubscribe()
      allowanceSubscription.unsubscribe()
    }
  }, [walletAddress, availableProxies, amount?.toString(), token, onGoBack])

  return {
    internals: {
      dpmMachine,
      allowanceMachine,
    },
    availableProxies,
    walletAddress,
    amount,
    token,
    isProxyReady,
    isWalletConnected,
    isAllowanceReady,
    isLoading, // just for the allowance loading state
    isEverythingReady: isAllowanceReady, // just for convenience, allowance is always the last step
    asUserAction,
    onEverythingReady,
    onGoBack,
  }
}
