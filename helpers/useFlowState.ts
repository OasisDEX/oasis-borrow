import BigNumber from 'bignumber.js'
import type { AaveV3SupportedNetwork } from 'blockchain/aave-v3'
import { getAaveV3UserAccountData } from 'blockchain/aave-v3'
import type { NetworkIds } from 'blockchain/networks'
import type { SparkV3SupportedNetwork } from 'blockchain/spark-v3'
import { getSparkV3UserAccountData } from 'blockchain/spark-v3'
import { userDpmProxies$ } from 'blockchain/userDpmProxies'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { getPositionCreatedEventForProxyAddress } from 'features/aave/services'
import { useObservable } from 'helpers/observableHook'
import { mapAaveUserAccountData$ } from 'lendingProtocols/aave-v3/pipelines'
import { mapSparkUserAccountData$ } from 'lendingProtocols/spark-v3/pipelines'
import { curry } from 'lodash'
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
  filterConsumedProxy?: (events: CreatePositionEvent[]) => boolean
  onEverythingReady?: UseFlowStateCBType
  onGoBack?: UseFlowStateCBType
  onProxiesAvailable?: (events: CreatePositionEvent[], dpmAccounts: UserDpmAccount[]) => void
  token?: string
  networkId: NetworkIds
}

function hasAaveOrSparkProtocol(events: CreatePositionEvent[]) {
  return events.filter(({ args }) => ['AAVE_V3', 'Spark'].includes(args.protocol)).length > 0
}
function hasAaveProtocol(events: CreatePositionEvent[]) {
  return events.filter(({ args }) => ['AAVE_V3'].includes(args.protocol)).length > 0
}
function hasMultiplyPosition(events: CreatePositionEvent[]) {
  return events.filter(({ args }) => ['Multiply'].includes(args.positionType)).length > 0
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
  const [lendingOnlyProxies, setLendingOnlyProxies] = useState<string[]>([])
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
    ).subscribe((userProxyEventsList) => {
      if (onProxiesAvailable && userProxyEventsList.length > 0)
        onProxiesAvailable(
          userProxyEventsList.flatMap(({ events }) => events),
          userProxyList,
        )
      setAvailableProxies(
        userProxyEventsList
          .filter(({ events }) =>
            events.length === 0 ? true : filterConsumedProxy ? filterConsumedProxy(events) : false,
          )
          .map(({ proxyAddress }) => proxyAddress),
      )
    })
    return () => {
      proxyListAvailabilityMap.unsubscribe()
    }
  }, [walletAddress, userProxyList])

  // list of AVAILABLE DPM which are lending only (just deposit to aave/spark, no debt; updated asynchronously)
  useEffect(() => {
    if (!walletAddress || !userProxyList.length || existingProxy || !networkId) return
    const proxyListAvailabilityMap = combineLatest(
      userProxyList.map(async ({ vaultId, proxy }) => ({
        proxyAddress: proxy,
        proxyId: vaultId,
        events: await getPositionCreatedEventForProxyAddress(networkId, proxy),
      })),
    ).subscribe(async (userProxyEventsList) => {
      const lendingOnlyProxiesTemp = userProxyEventsList.filter(({ events }) =>
        hasAaveOrSparkProtocol(events),
      )
      if (lendingOnlyProxiesTemp.length > 0) {
        // get a list of all proxies with aave/spark protocol
        // then create a list of calls to get user account data for each proxy
        // simple earn can reuse non-multiply, aave/spark DPMs with no debt
        // so we filter out proxies withmultiply positions (!hasMultiplyPosition)...
        const userPositionDataCalls = lendingOnlyProxiesTemp
          .filter(({ events }) => !hasMultiplyPosition(events))
          .map(({ events, proxyAddress }) =>
            hasAaveProtocol(events)
              ? curry(mapAaveUserAccountData$)(getAaveV3UserAccountData)({
                  networkId: networkId as AaveV3SupportedNetwork,
                  address: proxyAddress,
                })
              : curry(mapSparkUserAccountData$)(getSparkV3UserAccountData)({
                  networkId: networkId as SparkV3SupportedNetwork,
                  address: proxyAddress,
                }),
          )
        // ...and debt (totalDebt.eq(zero))
        const lendingOnlyProxiesList = (await Promise.all(userPositionDataCalls))
          .filter(({ totalDebt, address }) => totalDebt.eq(zero) && address)
          .map(({ address }) => address as string)

        setLendingOnlyProxies(lendingOnlyProxiesList)
      }
    })
    return () => {
      proxyListAvailabilityMap.unsubscribe()
    }
  }, [walletAddress, userProxyList, existingProxy, networkId])

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
    lendingOnlyProxies, // simple earn - currently only aave/spark
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
