import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { getNetworkContracts } from 'blockchain/contracts'
import type { IlkData } from 'blockchain/ilks'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { ContextConnected } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networks'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import type { AllowanceChanges } from 'features/allowance/allowance'
import { AllowanceOption, applyAllowanceChanges } from 'features/allowance/allowance'
import { openFlowInitialStopLossLevel } from 'features/automation/common/helpers'
import type {
  OpenVaultStopLossChanges,
  StopLossOpenFlowStages,
} from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import { applyOpenVaultStopLoss } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import {
  addStopLossTrigger,
  applyStopLossOpenFlowTransaction,
} from 'features/automation/protection/stopLoss/openFlow/stopLossOpenFlowTransaction'
import type { OpenVaultStopLossSetup } from 'features/borrow/open/pipes/openVault'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import type { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { createProxy } from 'features/proxy/createProxy'
import type { ProxyChanges } from 'features/proxy/proxy'
import { applyProxyChanges } from 'features/proxy/proxy'
import type { BalanceInfo } from 'features/shared/balanceInfo'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { PriceInfo } from 'features/shared/priceInfo'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { OpenVaultTransactionChange } from 'features/shared/transactions'
import type { UserSettingsState } from 'features/userSettings/userSettings'
import { slippageChange$ } from 'features/userSettings/userSettings'
import type { OpenVaultTransitionChange } from 'features/vaultTransitions/openVaultTransitions'
import { createApplyOpenVaultTransition } from 'features/vaultTransitions/openVaultTransitions'
import { getLocalAppConfig } from 'helpers/config'
import type { AddGasEstimationFunction, HasGasEstimation, TxHelpers } from 'helpers/context/types'
import { GasEstimationStatus } from 'helpers/context/types'
import { combineApplyChanges } from 'helpers/pipelines/combineApply'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, merge, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import type { ExchangeQuoteChanges } from './openMultiplyQuote'
import { applyExchange, createExchangeChange$, createInitialQuoteChange } from './openMultiplyQuote'
import type { OpenMultiplyVaultCalculations } from './openMultiplyVaultCalculations'
import {
  applyOpenMultiplyVaultCalculations,
  defaultOpenMultiplyVaultStateCalculations,
} from './openMultiplyVaultCalculations'
import type { OpenMultiplyVaultConditions } from './openMultiplyVaultConditions'
import {
  applyOpenVaultConditions,
  applyOpenVaultStageCategorisation,
  defaultOpenMultiplyVaultConditions,
} from './openMultiplyVaultConditions'
import type { OpenVaultEnvironmentChange } from './openMultiplyVaultEnvironment'
import { applyOpenVaultEnvironment } from './openMultiplyVaultEnvironment'
import type { OpenVaultInputChange } from './openMultiplyVaultInput'
import { applyOpenVaultInput } from './openMultiplyVaultInput'
import type { OpenVaultSummary } from './openMultiplyVaultSummary'
import { applyOpenVaultSummary, defaultOpenVaultSummary } from './openMultiplyVaultSummary'
import {
  applyEstimateGas,
  applyOpenMultiplyVaultTransaction,
  multiplyVault,
  setAllowance,
} from './openMultiplyVaultTransactions'
import { finalValidation, validateErrors, validateWarnings } from './openMultiplyVaultValidations'

interface OpenVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<OpenMultiplyVaultState>
}

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

export type OpenMultiplyVaultChange =
  | OpenVaultInputChange
  | OpenVaultTransitionChange
  | OpenVaultTransactionChange
  | AllowanceChanges
  | ProxyChanges
  | OpenVaultEnvironmentChange
  | OpenVaultInjectedOverrideChange
  | ExchangeQuoteChanges
  | OpenVaultStopLossChanges

export type ProxyStages =
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
export type AllowanceStages =
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceSuccess'

export type TxStage =
  | 'txWaitingForConfirmation'
  | 'txWaitingForApproval'
  | 'txInProgress'
  | 'txFailure'
  | 'txSuccess'

export type EditingStage = 'editing'
export type OpenMultiplyVaultStage =
  | EditingStage
  | ProxyStages
  | AllowanceStages
  | TxStage
  | StopLossOpenFlowStages

export interface MutableOpenMultiplyVaultState {
  stage: OpenMultiplyVaultStage
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  selectedAllowanceRadio: AllowanceOption
  allowanceAmount?: BigNumber
  id?: BigNumber
  requiredCollRatio?: BigNumber
  stopLossSkipped: boolean
  stopLossLevel: BigNumber
}

interface OpenMultiplyVaultFunctions {
  progress?: () => void
  regress?: () => void
  skipStopLoss?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateRequiredCollRatio?: (requiredCollRatio?: BigNumber) => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  clear: () => void
  injectStateOverride: (state: Partial<MutableOpenMultiplyVaultState>) => void
}

interface OpenMultiplyVaultEnvironment {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

interface OpenMultiplyVaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  txError?: TxError
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
  openVaultConfirmations?: number
  openVaultSafeConfirmations: number
}

export type OpenMultiplyVaultState = MutableOpenMultiplyVaultState &
  OpenMultiplyVaultCalculations &
  OpenMultiplyVaultFunctions &
  OpenMultiplyVaultEnvironment &
  OpenMultiplyVaultConditions &
  OpenMultiplyVaultTxInfo & {
    errorMessages: VaultErrorMessage[]
    warningMessages: VaultWarningMessage[]
    summary: OpenVaultSummary
    totalSteps: number
    currentStep: number
  } & OpenVaultStopLossSetup &
  HasGasEstimation

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

export const defaultMutableOpenMultiplyVaultState: MutableOpenMultiplyVaultState = {
  stage: 'editing' as OpenMultiplyVaultStage,
  selectedAllowanceRadio: AllowanceOption.UNLIMITED,
  allowanceAmount: maxUint256,
  depositAmount: undefined,
  depositAmountUSD: undefined,
  requiredCollRatio: undefined,
  stopLossSkipped: false,
  stopLossLevel: zero,
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
