import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { userDpmProxies$ } from 'blockchain/userDpmProxies'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { getPositionCreatedEventForProxyAddress } from 'features/aave/services'
import { useObservable } from 'helpers/observableHook'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

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

export type UseFlowStateProps = {
  amount?: BigNumber
  allowanceAmount?: BigNumber
  existingProxy?: string
  filterConsumedProxy?: (events: CreatePositionEvent[]) => Promise<boolean>
  onEverythingReady?: UseFlowStateCBType
  onGoBack?: UseFlowStateCBType
  onProxiesAvailable?: (events: CreatePositionEvent[], dpmAccounts: UserDpmAccount[]) => void
  token?: string
  networkId: NetworkIds
}

export function useFlowState({
  amount,
  allowanceAmount,
  existingProxy,
  filterConsumedProxy,
  onEverythingReady,
  onGoBack,
  onProxiesAvailable,
  token,
  networkId,
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
  const { dpmAccountStateMachine, allowanceStateMachine, allowanceForAccountEthers$ } =
    useProductContext()
  const { context$, connectedContext$ } = useMainContext()
  const { stateMachine: dpmMachine } = setupDpmContext(dpmAccountStateMachine, networkId)
  const [contextConnected] = useObservable(connectedContext$)
  const signer = contextConnected?.transactionProvider
  const { stateMachine: allowanceMachine } = setupAllowanceContext(
    allowanceStateMachine,
    networkId,
    signer,
    token,
  )

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
    minimumAmount: allowanceAmount || amount,
    allowanceType: 'unlimited',
    token,
    error: undefined,
  }

  const spender = availableProxies[0] // probably needs further thoguht

  // wallet connection + DPM proxy machine
  useEffect(() => {
    const walletConnectionSubscription = context$.subscribe(({ account, status }) => {
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
    const userDpmProxies = userDpmProxies$(walletAddress, networkId).subscribe((userProxyList) => {
      setUserProxyList(userProxyList)
    })
    return () => {
      userDpmProxies.unsubscribe()
    }
  }, [walletAddress])

  // list of AVAILABLE DPM proxies (updated asynchronously)
  useEffect(() => {
    if (!walletAddress || !userProxyList.length || existingProxy || !networkId) return
    const proxyListAvailabilityMap = combineLatest(
      userProxyList.map(async ({ vaultId, proxy }) => ({
        proxyAddress: proxy,
        proxyId: vaultId,
        events: await getPositionCreatedEventForProxyAddress(networkId, proxy),
      })),
    ).subscribe(async (userProxyEventsList) => {
      if (onProxiesAvailable && userProxyEventsList.length > 0)
        onProxiesAvailable(
          userProxyEventsList.flatMap(({ events }) => events),
          userProxyList,
        )
      const filteredProxiesList = await Promise.all(
        userProxyEventsList.map(async (proxyEvent) => {
          if (proxyEvent.events.length === 0) {
            return Promise.resolve(proxyEvent)
          }
          if (filterConsumedProxy) {
            const filtered = await filterConsumedProxy(proxyEvent.events)
            return !filtered ? Promise.resolve(proxyEvent) : Promise.resolve(false)
          }
          return Promise.resolve(false)
        }),
      )
      setAvailableProxies(
        (filteredProxiesList.filter(Boolean) as typeof userProxyEventsList).map(
          ({ proxyAddress }) => proxyAddress,
        ),
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
  }, [token, isProxyReady, walletAddress, amount])

  // allowance machine
  useEffect(() => {
    if (!isProxyReady || !allDefined(walletAddress, amount, token)) return
    if (token === 'ETH') {
      setLoading(false)
      setAllowanceReady(true)
      return
    }
    const allowanceSubscription = allowanceForAccountEthers$(token!, spender, networkId).subscribe(
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
      const allowanceAmountChanged =
        baseAllowanceContext.minimumAmount &&
        !context.minimumAmount?.eq(baseAllowanceContext.minimumAmount)
      const tokenChanged = context.token !== token
      const spenderChanged = context.spender !== spender
      const inputChange =
        amount?.toString() && (spenderChanged || allowanceAmountChanged || tokenChanged)

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
