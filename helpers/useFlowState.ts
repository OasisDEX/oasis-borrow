import BigNumber from 'bignumber.js'
import { userDpmProxies$ } from 'blockchain/userDpmProxies'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { PositionFromUrl } from 'features/omni-kit/observables'
import { getPositionsFromUrlData } from 'features/omni-kit/observables'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { useObservable } from 'helpers/observableHook'
import type { LendingProtocol } from 'lendingProtocols'
import { useEffect, useState } from 'react'
import { combineLatest } from 'rxjs'

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
  allowanceAmount?: BigNumber
  amount?: BigNumber
  existingProxy?: {
    address: string
    id: string
  }
  filterConsumedProxy?: (events: PositionFromUrl[]) => Promise<boolean>
  networkId: OmniSupportedNetworkIds
  onEverythingReady?: UseFlowStateCBType
  onGoBack?: UseFlowStateCBType
  onProxiesAvailable?: (events: PositionFromUrl[], dpmAccounts: UserDpmAccount[]) => void
  pairId: number
  protocol: LendingProtocol
  token?: string
  step?: string
  useHeaderBackBtn?: boolean
  lockUiDataLoading?: boolean
}

export function useFlowState({
  allowanceAmount,
  amount,
  existingProxy,
  filterConsumedProxy,
  networkId,
  onEverythingReady,
  onGoBack,
  onProxiesAvailable,
  pairId,
  protocol,
  token,
  step,
  useHeaderBackBtn,
  lockUiDataLoading,
}: UseFlowStateProps) {
  const [isWalletConnected, setWalletConnected] = useState<boolean>(false)
  const [asUserAction, setAsUserAction] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>()
  const [userProxyList, setUserProxyList] = useState<UserDpmAccount[]>([])
  const [availableProxies, setAvailableProxies] = useState<{ address: string; id: string }[]>(
    existingProxy ? [existingProxy] : [],
  )
  const [isAllowanceReady, setAllowanceReady] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isUiDataLoading, setUiDataLoading] = useState<boolean>(true) // needed to be able to show skeleton when dpm data is being loaded
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

  const spender = availableProxies[0]?.address // probably needs further thoguht

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
        !availableProxies?.find((item) => item.address === context.result?.proxy) &&
        event.type === 'CONTINUE'
      ) {
        setAsUserAction(true)
        setAvailableProxies([
          ...(availableProxies || []),
          { address: context.result.proxy, id: context.result.vaultId },
        ])
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
      if (userProxyList.length === 0) {
        setUiDataLoading(false)
      }

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
        events: await getPositionsFromUrlData({
          networkId,
          pairId,
          positionId: Number(vaultId),
          protocol,
        }),
      })),
    ).subscribe(async (userProxyEventsList) => {
      if (onProxiesAvailable && userProxyEventsList.length > 0) {
        onProxiesAvailable(
          userProxyEventsList.flatMap(({ events: { positions } }) => positions),
          userProxyList,
        )
      }
      const filteredProxiesList = await Promise.all(
        userProxyEventsList.map(async (proxyEvent) => {
          if (proxyEvent.events.positions.length === 0) {
            return Promise.resolve(proxyEvent)
          }
          if (filterConsumedProxy) {
            const filtered = await filterConsumedProxy(proxyEvent.events.positions)
            return filtered ? Promise.resolve(proxyEvent) : Promise.resolve(false)
          }
          return Promise.resolve(false)
        }),
      )
      const filteredAndSortedproxiesList = (
        filteredProxiesList.filter(Boolean) as typeof userProxyEventsList
      ).sort((aproxy, bproxy) => Number(aproxy.proxyId) - Number(bproxy.proxyId))

      if (filteredAndSortedproxiesList.length === 0) {
        setUiDataLoading(false)
      }

      setAvailableProxies(
        filteredAndSortedproxiesList.map(({ proxyAddress, proxyId }) => ({
          address: proxyAddress,
          id: proxyId,
        })),
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
      setUiDataLoading(false)
      setAllowanceReady(false)
    }
  }, [token, isProxyReady, walletAddress, amount])

  // allowance machine
  useEffect(() => {
    if (!isProxyReady || !spender || !allDefined(walletAddress, amount, token)) return
    if (token === 'ETH') {
      setLoading(false)
      setUiDataLoading(false)
      setAllowanceReady(true)
      return
    }
    const allowanceSubscription = allowanceForAccountEthers$(token!, spender, networkId).subscribe(
      (allowanceData) => {
        if (allowanceData && allowanceMachineSubscription) {
          setLoading(false)
          setUiDataLoading(false)
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
    isUiDataLoading,
    isEverythingReady: isAllowanceReady, // just for convenience, allowance is always the last step
    asUserAction,
    onEverythingReady,
    onGoBack,
    step,
    useHeaderBackBtn,
    lockUiDataLoading,
  }
}
