import type { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { applyAllowanceChanges } from 'features/allowance/allowance'
import { openFlowInitialStopLossLevel } from 'features/automation/common/openFlowInitialStopLossLevel'
import { applyOpenVaultStopLoss } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import {
  addStopLossTrigger,
  applyStopLossOpenFlowTransaction,
} from 'features/automation/protection/stopLoss/openFlow/stopLossOpenFlowTransaction'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import type { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { createProxy } from 'features/proxy/createProxy'
import { applyProxyChanges } from 'features/proxy/proxy'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { slippageChange$ } from 'features/userSettings/userSettings'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { createApplyOpenVaultTransition } from 'features/vaultTransitions/openVaultTransitions'
import { getLocalAppConfig } from 'helpers/config'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { combineApplyChanges } from 'helpers/pipelines/combineApply'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, merge, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import { applyExchange, createExchangeChange$, createInitialQuoteChange } from './openMultiplyQuote'
import { defaultMutableOpenMultiplyVaultState } from './openMultiplyVault.constants'
import type {
  MutableOpenMultiplyVaultState,
  OpenMultiplyVaultChange,
  OpenMultiplyVaultState,
} from './openMultiplyVault.types'
import { applyOpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations'
import { defaultOpenMultiplyVaultStateCalculations } from './openMultiplyVaultCalculations.constants'
import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations.types'
import {
  applyOpenVaultConditions,
  applyOpenVaultStageCategorisation,
} from './openMultiplyVaultConditions'
import { defaultOpenMultiplyVaultConditions } from './openMultiplyVaultConditions.constants'
import type { OpenMultiplyVaultConditions } from './openMultiplyVaultConditions.types'
import { applyOpenVaultEnvironment } from './openMultiplyVaultEnvironment'
import { applyOpenVaultInput } from './openMultiplyVaultInput'
import { applyOpenVaultSummary } from './openMultiplyVaultSummary'
import { defaultOpenVaultSummary } from './openMultiplyVaultSummary.constants'
import {
  applyEstimateGas,
  applyOpenMultiplyVaultTransaction,
  multiplyVault,
  setAllowance,
} from './openMultiplyVaultTransactions'
import { finalValidation, validateErrors, validateWarnings } from './openMultiplyVaultValidations'

function applyOpenVaultInjectedOverride(
  state: OpenMultiplyVaultState,
  change: OpenMultiplyVaultChange,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

function addTransitions(
  txHelpers: TxHelpers,
  context: ContextConnected,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenMultiplyVaultChange) => void,
  state: OpenMultiplyVaultState,
): OpenMultiplyVaultState {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => {
        change({ kind: 'deposit', depositAmount })
      },
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateRequiredCollRatio: (requiredCollRatio?: BigNumber) => {
        change({ kind: 'requiredCollRatio', requiredCollRatio })
      },
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'stopLossEditing') {
    return {
      ...state,
      progress: () => change({ kind: 'progressStopLossEditing' }),
      regress: () => change({ kind: 'backToEditing' }),
      skipStopLoss: () => change({ kind: 'skipStopLoss' }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressProxy',
        }),
    }
  }

  if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
    return {
      ...state,
      updateAllowanceAmount: (allowanceAmount?: BigNumber) =>
        change({
          kind: 'allowance',
          allowanceAmount,
        }),
      setAllowanceAmountUnlimited: () => change({ kind: 'allowanceUnlimited' }),
      setAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'allowanceAsDepositAmount',
        }),
      setAllowanceAmountCustom: () =>
        change({
          kind: 'allowanceCustom',
        }),
      progress: () => setAllowance(txHelpers, change, state),
      regress: () => change({ kind: 'regressAllowance' }),
    }
  }

  if (state.stage === 'allowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'backToEditing',
        }),
    }
  }

  if (state.stage === 'txWaitingForConfirmation' || state.stage === 'txFailure') {
    return {
      ...state,
      progress: () => multiplyVault(txHelpers, context, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'txSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'backToEditing',
        }),
    }
  }

  if (state.stage === 'stopLossTxWaitingForConfirmation' || state.stage === 'stopLossTxFailure') {
    return {
      ...state,
      progress: () => addStopLossTrigger(txHelpers, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  return state
}

export function createOpenMultiplyVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  addGasEstimation$: AddGasEstimationFunction,
  slippageLimit$: Observable<UserSettingsState>,
  ilk: string,
): Observable<OpenMultiplyVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkData$(ilk), slippageLimit$).pipe(
          first(),
          switchMap(([context, txHelpers, ilkData, { slippage }]) => {
            const { token } = ilkData
            const account = context.account
            return combineLatest(
              priceInfo$(token),
              balanceInfo$(token, account),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(([priceInfo, balanceInfo, proxyAddress]) =>
                ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
                  first(),
                  switchMap((allowance) => {
                    const change$ = new Subject<OpenMultiplyVaultChange>()

                    function change(ch: OpenMultiplyVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(
                      stateToOverride: Partial<MutableOpenMultiplyVaultState>,
                    ) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    const { StopLossWrite: stopLossWriteEnabled } = getLocalAppConfig('features')
                    const withStopLossStage = stopLossWriteEnabled
                      ? isSupportedAutomationIlk(context.chainId, ilk)
                      : false

                    const totalSteps = calculateInitialTotalSteps(proxyAddress, token, allowance)

                    const initialStopLossSelected = openFlowInitialStopLossLevel({
                      liquidationRatio: ilkData.liquidationRatio,
                    })

                    const initialState: OpenMultiplyVaultState = {
                      ...defaultMutableOpenMultiplyVaultState,
                      ...defaultOpenMultiplyVaultStateCalculations,
                      ...defaultOpenMultiplyVaultConditions,
                      withStopLossStage,
                      setStopLossCloseType: (type: 'collateral' | 'dai') =>
                        change({ kind: 'stopLossCloseType', type }),
                      setStopLossLevel: (level: BigNumber) =>
                        change({ kind: 'stopLossLevel', level }),
                      stopLossCloseType: 'dai',
                      stopLossLevel: initialStopLossSelected,
                      visitedStopLossStep: false,
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      safeConfirmations: getNetworkContracts(NetworkIds.MAINNET, context.chainId)
                        .safeConfirmations,
                      openVaultSafeConfirmations: getNetworkContracts(
                        NetworkIds.MAINNET,
                        context.chainId,
                      ).openVaultSafeConfirmations,
                      etherscan: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan
                        .url,
                      errorMessages: [],
                      warningMessages: [],
                      summary: defaultOpenVaultSummary,
                      slippage,
                      totalSteps,
                      currentStep: 1,
                      exchangeError: false,
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                    }

                    const stateSubject$ = new Subject<OpenMultiplyVaultState>()

                    const apply = combineApplyChanges<
                      OpenMultiplyVaultState,
                      OpenMultiplyVaultChange
                    >(
                      applyOpenVaultInput,
                      applyOpenVaultStopLoss,
                      applyExchange,
                      createApplyOpenVaultTransition<
                        OpenMultiplyVaultState,
                        MutableOpenMultiplyVaultState,
                        OpenMultiplyVaultCalculations,
                        OpenMultiplyVaultConditions
                      >(
                        defaultMutableOpenMultiplyVaultState,
                        defaultOpenMultiplyVaultStateCalculations,
                        defaultOpenMultiplyVaultConditions,
                      ),
                      applyProxyChanges,
                      applyAllowanceChanges,
                      applyOpenMultiplyVaultTransaction,
                      applyStopLossOpenFlowTransaction,
                      applyOpenVaultEnvironment,
                      applyOpenVaultInjectedOverride,
                      applyOpenMultiplyVaultCalculations,
                      applyOpenVaultStageCategorisation,
                      applyOpenVaultConditions,
                      applyOpenVaultSummary,
                    )

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, token),
                      balanceInfoChange$(balanceInfo$, token, account),
                      createIlkDataChange$(ilkData$, ilk),
                      createInitialQuoteChange(exchangeQuote$, token, slippage),
                      createExchangeChange$(exchangeQuote$, stateSubject$),
                      slippageChange$(slippageLimit$),
                    )

                    const connectedProxyAddress$ = proxyAddress$(account)

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(validateErrors),
                      map(validateWarnings),
                      switchMap(curry(applyEstimateGas)(addGasEstimation$)),
                      map(finalValidation),
                      map(
                        curry(addTransitions)(txHelpers, context, connectedProxyAddress$, change),
                      ),
                      tap((state) => stateSubject$.next(state)),
                    )
                  }),
                ),
              ),
            )
          }),
        ),
      ),
    ),
    shareReplay(1),
  )
}
