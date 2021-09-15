import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { calculateInitialTotalSteps } from 'features/openVault/openVaultConditions'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { SLIPPAGE } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import { BalanceInfo, balanceInfoChange$ } from '../shared/balanceInfo'
import {
  applyExchange,
  createExchangeChange$,
  createInitialQuoteChange,
  ExchangeQuoteChanges,
} from './manageMultiplyQuote'
import {
  applyManageVaultAllowance,
  ManageVaultAllowanceChange,
} from './manageMultiplyVaultAllowances'
import {
  applyManageVaultCalculations,
  defaultManageMultiplyVaultCalculations,
  ManageVaultCalculations,
} from './manageMultiplyVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageMultiplyVaultConditions,
  ManageVaultConditions,
} from './manageMultiplyVaultConditions'
import {
  applyManageVaultEnvironment,
  ManageVaultEnvironmentChange,
} from './manageMultiplyVaultEnvironment'
import { applyManageVaultForm, ManageVaultFormChange } from './manageMultiplyVaultForm'
import { applyManageVaultInput, ManageVaultInputChange } from './manageMultiplyVaultInput'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
  ManageVaultSummary,
} from './manageMultiplyVaultSummary'
import {
  applyManageVaultTransaction,
  createProxy,
  ManageVaultTransactionChange,
  setCollateralAllowance,
  setDaiAllowance,
} from './manageMultiplyVaultTransactions'
import {
  applyManageVaultTransition,
  ManageVaultTransitionChange,
  progressAdjust,
} from './manageMultiplyVaultTransitions'
import {
  ManageVaultErrorMessage,
  ManageVaultWarningMessage,
  validateErrors,
  validateWarnings,
} from './manageMultiplyVaultValidations'

interface ManageVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<ManageMultiplyVaultState>
}

function applyManageVaultInjectedOverride(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type ManageMultiplyVaultChange =
  | ManageVaultInputChange
  | ManageVaultFormChange
  | ManageVaultAllowanceChange
  | ManageVaultTransitionChange
  | ManageVaultTransactionChange
  | ManageVaultEnvironmentChange
  | ManageVaultInjectedOverrideChange
  | ExchangeQuoteChanges

function apply(state: ManageMultiplyVaultState, change: ManageMultiplyVaultChange) {
  const s1 = applyManageVaultInput(change, state)
  const s1_ = applyExchange(change, s1)
  const s2 = applyManageVaultForm(change, s1_)
  const s3 = applyManageVaultAllowance(change, s2)
  const s4 = applyManageVaultTransition(change, s3)
  const s5 = applyManageVaultTransaction(change, s4)
  const s6 = applyManageVaultEnvironment(change, s5)
  const s7 = applyManageVaultInjectedOverride(change, s6)
  const s8 = applyManageVaultCalculations(s7)
  const s9 = applyManageVaultStageCategorisation(s8)
  const s10 = applyManageVaultConditions(s9)
  return applyManageVaultSummary(s10)
}

export type ManageMultiplyVaultEditingStage = 'adjustPosition' | 'otherActions'

export type ManageMultiplyVaultStage =
  | ManageMultiplyVaultEditingStage
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'collateralAllowanceWaitingForConfirmation'
  | 'collateralAllowanceWaitingForApproval'
  | 'collateralAllowanceInProgress'
  | 'collateralAllowanceFailure'
  | 'collateralAllowanceSuccess'
  | 'daiAllowanceWaitingForConfirmation'
  | 'daiAllowanceWaitingForApproval'
  | 'daiAllowanceInProgress'
  | 'daiAllowanceFailure'
  | 'daiAllowanceSuccess'
  | 'manageWaitingForConfirmation'
  | 'manageWaitingForApproval'
  | 'manageInProgress'
  | 'manageFailure'
  | 'manageSuccess'

export type MainAction = 'buy' | 'sell'
export type CloseVaultTo = 'collateral' | 'dai'
export type OtherAction =
  | 'depositCollateral'
  | 'depositDai'
  | 'withdrawCollateral'
  | 'withdrawDai'
  | 'closeVault'

export interface MutableManageMultiplyVaultState {
  stage: ManageMultiplyVaultStage
  originalEditingStage: ManageMultiplyVaultEditingStage
  mainAction: MainAction
  otherAction: OtherAction
  showSliderController: boolean

  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
  paybackAmount?: BigNumber
  generateAmount?: BigNumber
  closeVaultTo: CloseVaultTo

  collateralAllowanceAmount?: BigNumber
  daiAllowanceAmount?: BigNumber
  selectedCollateralAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  selectedDaiAllowanceRadio: 'unlimited' | 'paybackAmount' | 'custom'

  requiredCollRatio?: BigNumber
  buyAmount?: BigNumber
  buyAmountUSD?: BigNumber

  sellAmount?: BigNumber
  sellAmountUSD?: BigNumber
}

export interface ManageVaultEnvironment {
  account?: string
  accountIsController: boolean
  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  vault: Vault
  ilkData: IlkData
  balanceInfo: BalanceInfo
  priceInfo: PriceInfo
  quote?: Quote
  swap?: Quote
  exchangeError: boolean
  slippage: BigNumber
}

interface ManageVaultFunctions {
  progress?: () => void
  regress?: () => void
  toggle?: () => void

  updateDepositAmount?: (depositAmount?: BigNumber) => void
  updateDepositAmountUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositAmountMax?: () => void
  updatePaybackAmount?: (paybackAmount?: BigNumber) => void
  updatePaybackAmountMax?: () => void

  updateWithdrawAmount?: (withdrawAmount?: BigNumber) => void
  updateWithdrawAmountUSD?: (withdrawAmountUSD?: BigNumber) => void
  updateWithdrawAmountMax?: () => void
  updateGenerateAmount?: (generateAmount?: BigNumber) => void
  updateGenerateAmountMax?: () => void

  setCloseVaultTo?: (closeVaultTo: CloseVaultTo) => void

  updateCollateralAllowanceAmount?: (amount?: BigNumber) => void
  setCollateralAllowanceAmountUnlimited?: () => void
  setCollateralAllowanceAmountToDepositAmount?: () => void
  resetCollateralAllowanceAmount?: () => void
  updateDaiAllowanceAmount?: (amount?: BigNumber) => void
  setDaiAllowanceAmountUnlimited?: () => void
  setDaiAllowanceAmountToPaybackAmount?: () => void
  resetDaiAllowanceAmount?: () => void
  clear: () => void

  injectStateOverride: (state: Partial<MutableManageMultiplyVaultState>) => void

  toggleSliderController?: () => void
  updateRequiredCollRatio?: (value: BigNumber) => void
  setMainAction?: (mainAction: MainAction) => void
  setOtherAction?: (otherAction: OtherAction) => void
  updateBuy?: (buyAmount?: BigNumber) => void
  updateBuyUSD?: (buyAmountUSD?: BigNumber) => void
  updateBuyMax?: () => void
  updateSell?: (sellAmount?: BigNumber) => void
  updateSellUSD?: (sellAmountUSD?: BigNumber) => void
  updateSellMax?: () => void
}

interface ManageVaultTxInfo {
  collateralAllowanceTxHash?: string
  daiAllowanceTxHash?: string
  proxyTxHash?: string
  manageTxHash?: string
  txError?: any
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type ManageMultiplyVaultState = MutableManageMultiplyVaultState &
  ManageVaultCalculations &
  ManageVaultConditions &
  ManageVaultEnvironment &
  ManageVaultFunctions &
  ManageVaultTxInfo & {
    errorMessages: ManageVaultErrorMessage[]
    warningMessages: ManageVaultWarningMessage[]
    summary: ManageVaultSummary
    initialTotalSteps: number
    totalSteps: number
    currentStep: number
  }

function addTransitions(
  txHelpers$: Observable<TxHelpers>,
  context: Context,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: ManageMultiplyVaultChange) => void,
  state: ManageMultiplyVaultState,
): ManageMultiplyVaultState {
  if (state.stage === 'adjustPosition' || state.stage === 'otherActions') {
    return {
      ...state,
      updateDepositAmount: (depositAmount?: BigNumber) => {
        change({ kind: 'depositAmount', depositAmount })
      },
      updateDepositAmountUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositAmountUSD', depositAmountUSD }),
      updateDepositAmountMax: () => change({ kind: 'depositAmountMax' }),

      updatePaybackAmount: (paybackAmount?: BigNumber) => {
        change({ kind: 'paybackAmount', paybackAmount })
      },
      updatePaybackAmountMax: () => change({ kind: 'paybackAmountMax' }),
      updateWithdrawAmount: (withdrawAmount?: BigNumber) => {
        change({ kind: 'withdrawAmount', withdrawAmount })
      },
      updateWithdrawAmountUSD: (withdrawAmountUSD?: BigNumber) =>
        change({ kind: 'withdrawAmountUSD', withdrawAmountUSD }),
      updateWithdrawAmountMax: () => change({ kind: 'withdrawAmountMax' }),

      updateGenerateAmount: (generateAmount?: BigNumber) => {
        change({ kind: 'generateAmount', generateAmount })
      },
      updateGenerateAmountMax: () => change({ kind: 'generateAmountMax' }),

      setCloseVaultTo: (closeVaultTo: CloseVaultTo) =>
        change({ kind: 'closeVaultTo', closeVaultTo }),

      toggle: () => change({ kind: 'toggleEditing' }),
      progress: () => change({ kind: 'progressEditing' }),
      toggleSliderController: () => change({ kind: 'toggleSliderController' }),
      updateRequiredCollRatio: (requiredCollRatio: BigNumber) =>
        change({ kind: 'requiredCollRatio', requiredCollRatio }),
      setMainAction: (mainAction: MainAction) => change({ kind: 'mainAction', mainAction }),
      updateBuy: (buyAmount?: BigNumber) => change({ kind: 'buyAmount', buyAmount }),
      updateBuyUSD: (buyAmountUSD?: BigNumber) => change({ kind: 'buyAmountUSD', buyAmountUSD }),
      updateBuyMax: () => change({ kind: 'buyMax' }),
      updateSell: (sellAmount?: BigNumber) => change({ kind: 'sellAmount', sellAmount }),
      updateSellUSD: (sellAmountUSD?: BigNumber) =>
        change({ kind: 'sellAmountUSD', sellAmountUSD }),
      updateSellMax: () => change({ kind: 'sellMax' }),
      setOtherAction: (otherAction: OtherAction) => change({ kind: 'otherAction', otherAction }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers$, proxyAddress$, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressProxy' }),
    }
  }

  if (
    state.stage === 'collateralAllowanceWaitingForConfirmation' ||
    state.stage === 'collateralAllowanceFailure'
  ) {
    return {
      ...state,
      updateCollateralAllowanceAmount: (collateralAllowanceAmount?: BigNumber) =>
        change({
          kind: 'collateralAllowance',
          collateralAllowanceAmount,
        }),
      setCollateralAllowanceAmountUnlimited: () => change({ kind: 'collateralAllowanceUnlimited' }),
      setCollateralAllowanceAmountToDepositAmount: () =>
        change({
          kind: 'collateralAllowanceAsDepositAmount',
        }),
      resetCollateralAllowanceAmount: () =>
        change({
          kind: 'collateralAllowanceReset',
        }),
      progress: () => setCollateralAllowance(txHelpers$, change, state),
      regress: () => change({ kind: 'regressCollateralAllowance' }),
    }
  }

  if (state.stage === 'collateralAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'progressCollateralAllowance' }),
    }
  }

  if (
    state.stage === 'daiAllowanceWaitingForConfirmation' ||
    state.stage === 'daiAllowanceFailure'
  ) {
    return {
      ...state,
      updateDaiAllowanceAmount: (daiAllowanceAmount?: BigNumber) =>
        change({ kind: 'daiAllowance', daiAllowanceAmount }),
      setDaiAllowanceAmountUnlimited: () => change({ kind: 'daiAllowanceUnlimited' }),
      setDaiAllowanceAmountToPaybackAmount: () => change({ kind: 'daiAllowanceAsPaybackAmount' }),
      resetDaiAllowanceAmount: () =>
        change({
          kind: 'daiAllowanceReset',
        }),
      progress: () => setDaiAllowance(txHelpers$, change, state),
      regress: () => change({ kind: 'regressDaiAllowance' }),
    }
  }

  if (state.stage === 'daiAllowanceSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => progressAdjust(txHelpers$, context, state, change),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'manageSuccess') {
    return {
      ...state,
      progress: () => change({ kind: 'resetToEditing' }),
    }
  }

  return state
}

export function defaultMutableManageMultiplyVaultState(
  lockedCollateral?: BigNumber,
): MutableManageMultiplyVaultState {
  const hasZeroCollateral = lockedCollateral?.eq(zero)

  return {
    stage: hasZeroCollateral ? 'otherActions' : 'adjustPosition',
    originalEditingStage: hasZeroCollateral ? 'otherActions' : 'adjustPosition',
    collateralAllowanceAmount: maxUint256,
    daiAllowanceAmount: maxUint256,
    selectedCollateralAllowanceRadio: 'unlimited',
    selectedDaiAllowanceRadio: 'unlimited',
    showSliderController: true,
    closeVaultTo: 'collateral',
    mainAction: 'buy',
    otherAction: 'depositCollateral',
  }
}

export function createManageMultiplyVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber) => Observable<Vault>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
  ) => Observable<Quote>,
  id: BigNumber,
): Observable<ManageMultiplyVaultState> {
  return context$.pipe(
    switchMap((context) => {
      const account = context.status === 'connected' ? context.account : undefined
      return vault$(id).pipe(
        first(),
        switchMap((vault) => {
          return combineLatest(
            priceInfo$(vault.token),
            balanceInfo$(vault.token, account),
            ilkData$(vault.ilk),
            account ? proxyAddress$(account) : of(undefined),
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) => {
              const collateralAllowance$ =
                account && proxyAddress
                  ? allowance$(vault.token, account, proxyAddress)
                  : of(undefined)
              const daiAllowance$ =
                account && proxyAddress ? allowance$('DAI', account, proxyAddress) : of(undefined)

              return combineLatest(collateralAllowance$, daiAllowance$).pipe(
                first(),
                switchMap(([collateralAllowance, daiAllowance]) => {
                  const change$ = new Subject<ManageMultiplyVaultChange>()

                  function change(ch: ManageMultiplyVaultChange) {
                    change$.next(ch)
                  }

                  // NOTE: Not to be used in production/dev, test only
                  function injectStateOverride(
                    stateToOverride: Partial<MutableManageMultiplyVaultState>,
                  ) {
                    return change$.next({ kind: 'injectStateOverride', stateToOverride })
                  }

                  const initialTotalSteps = calculateInitialTotalSteps(
                    proxyAddress,
                    vault.token,
                    'skip',
                  )

                  const initialState: ManageMultiplyVaultState = {
                    ...defaultMutableManageMultiplyVaultState(vault.lockedCollateral),
                    ...defaultManageMultiplyVaultCalculations,
                    ...defaultManageMultiplyVaultConditions,
                    vault,
                    priceInfo,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    safeConfirmations: context.safeConfirmations,
                    etherscan: context.etherscan.url,
                    errorMessages: [],
                    warningMessages: [],
                    summary: defaultManageVaultSummary,
                    slippage: SLIPPAGE,
                    exchangeError: false,
                    initialTotalSteps,
                    totalSteps: initialTotalSteps,
                    currentStep: 1,
                    clear: () => change({ kind: 'clear' }),
                    injectStateOverride,
                  }

                  const stateSubject$ = new Subject<ManageMultiplyVaultState>()

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id),
                    createInitialQuoteChange(exchangeQuote$, vault.token),
                    createExchangeChange$(exchangeQuote$, stateSubject$),
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    map(curry(addTransitions)(txHelpers$, context, connectedProxyAddress$, change)),
                    tap((state) => stateSubject$.next(state)),
                  )
                }),
              )
            }),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
