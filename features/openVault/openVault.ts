import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { applyOpenVaultAllowance, OpenVaultAllowanceChange } from './openVaultAllowances'
import { applyOpenVaultEnvironment, OpenVaultEnvironmentChange } from './openVaultEnvironment'
import { applyOpenVaultForm, OpenVaultFormChange } from './openVaultForm'
import { applyOpenVaultInput, OpenVaultInputChange } from './openVaultInput'
import {
  applyOpenVaultTransaction,
  createProxy,
  openVault,
  OpenVaultTransactionChange,
  setAllowance,
} from './openVaultTransactions'
import { applyOpenVaultTransition, OpenVaultTransitionChange } from './openVaultTransitions'
import {
  OpenVaultErrorMessage,
  OpenVaultWarningMessage,
  validateErrors,
  validateWarnings,
} from './openVaultValidations'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

export function categoriseOpenVaultStage(stage: OpenVaultStage) {
  switch (stage) {
    case 'editing':
      return {
        ...defaultOpenVaultStageCategories,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isOpenStage: true,
      }
  }
}

export function applyOpenVaultCalculations(state: OpenVaultState): OpenVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    currentCollateralPrice,
    liquidationRatio,
    depositAmountUSD,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)
  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero

  const afterCollateralizationRatio =
    depositAmountUSD && generateAmount && !generateAmount.eq(zero)
      ? depositAmountUSD.div(generateAmount)
      : zero

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? generateAmount.times(liquidationRatio).div(depositAmount)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxDepositAmountUSD,
    maxGenerateAmount,
    afterCollateralizationRatio,
    afterLiquidationPrice,
  }
}

interface OpenVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<OpenVaultState>
}

function applyOpenVaultInjectedOverride(change: OpenVaultChange, state: OpenVaultState) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type OpenVaultChange =
  | OpenVaultInputChange
  | OpenVaultFormChange
  | OpenVaultTransitionChange
  | OpenVaultTransactionChange
  | OpenVaultAllowanceChange
  | OpenVaultEnvironmentChange
  | OpenVaultInjectedOverrideChange

function apply(state: OpenVaultState, change: OpenVaultChange) {
  const s1 = applyOpenVaultInput(change, state)
  const s2 = applyOpenVaultForm(change, s1)
  const s3 = applyOpenVaultTransition(change, s2)
  const s4 = applyOpenVaultTransaction(change, s3)
  const s5 = applyOpenVaultAllowance(change, s4)
  const s6 = applyOpenVaultEnvironment(change, s5)
  const s7 = applyOpenVaultInjectedOverride(change, s6)
  return applyOpenVaultCalculations(s7)
}

export type OpenVaultStage =
  | 'editing'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxySuccess'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceSuccess'
  | 'openWaitingForConfirmation'
  | 'openWaitingForApproval'
  | 'openInProgress'
  | 'openFailure'
  | 'openSuccess'

export type DefaultOpenVaultState = {
  stage: OpenVaultStage
  ilk: string
  account: string
  token: string

  errorMessages: OpenVaultErrorMessage[]
  warningMessages: OpenVaultWarningMessage[]

  proxyAddress?: string
  allowance?: BigNumber
  progress?: () => void
  reset?: () => void
  id?: BigNumber

  toggleGenerateOption?: () => void
  toggleIlkDetails?: () => void
  showGenerateOption: boolean
  showIlkDetails: boolean

  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  maxDepositAmount: BigNumber
  maxDepositAmountUSD: BigNumber
  generateAmount?: BigNumber
  maxGenerateAmount: BigNumber
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void

  allowanceAmount?: BigNumber
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: (amount?: BigNumber) => void
  setAllowanceAmountToDepositAmount?: (amount?: BigNumber) => void
  resetAllowanceAmount?: () => void

  maxDebtPerUnitCollateral: BigNumber
  ilkDebtAvailable: BigNumber
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string

  injectStateOverride: (state: Partial<OpenVaultState>) => void
}

export type OpenVaultState = PriceInfo & BalanceInfo & DefaultOpenVaultState

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
): OpenVaultState {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => change({ kind: 'deposit', depositAmount }),
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateGenerate: (generateAmount?: BigNumber) => change({ kind: 'generate', generateAmount }),
      updateGenerateMax: () => change({ kind: 'generateMax' }),
      toggleGenerateOption: () => change({ kind: 'toggleGenerateOption' }),
      toggleIlkDetails: () => change({ kind: 'toggleIlkDetails' }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(txHelpers, proxyAddress$, change, state),
    }
  }

  if (state.stage === 'proxySuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'progressProxy',
        }),
      reset: () => change({ kind: 'backToEditing' }),
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
      resetAllowanceAmount: () =>
        change({
          kind: 'allowance',
          allowanceAmount: undefined,
        }),

      progress: () => setAllowance(txHelpers, change, state),
      reset: () => change({ kind: 'backToEditing' }),
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

  if (state.stage === 'openWaitingForConfirmation' || state.stage === 'openFailure') {
    return {
      ...state,
      progress: () => openVault(txHelpers, change, state),
      reset: () => change({ kind: 'backToEditing' }),
    }
  }

  return state
}

export const defaultPartialOpenVaultState = {
  stage: 'editing' as OpenVaultStage,
  errorMessages: [],
  warningMessages: [],
  showIlkDetails: false,
  showGenerateOption: false,
  afterLiquidationPrice: zero,
  afterCollateralizationRatio: zero,
  maxDepositAmount: zero,
  maxDepositAmountUSD: zero,
  maxGenerateAmount: zero,
}

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilks$: Observable<string[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<OpenVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(context$, txHelpers$, ilkToToken$).pipe(
          switchMap(([context, txHelpers, ilkToToken]) => {
            const account = context.account
            const token = ilkToToken(ilk)
            return combineLatest(
              priceInfo$(token),
              balanceInfo$(token, account),
              ilkData$(ilk),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(
                ([
                  priceInfo,
                  balanceInfo,
                  { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                  proxyAddress,
                ]) =>
                  (
                    (proxyAddress && allowance$(token, account, proxyAddress)) ||
                    of(undefined)
                  ).pipe(
                    first(),
                    switchMap((allowance) => {
                      const change$ = new Subject<OpenVaultChange>()

                      function change(ch: OpenVaultChange) {
                        change$.next(ch)
                      }

                      // NOTE: Not to be used in production/dev, test only
                      function injectStateOverride(stateToOverride: Partial<OpenVaultState>) {
                        return change$.next({ kind: 'injectStateOverride', stateToOverride })
                      }

                      const initialState: OpenVaultState = {
                        ...priceInfo,
                        ...balanceInfo,
                        ...defaultPartialOpenVaultState,
                        token,
                        account,
                        ilk,
                        maxDebtPerUnitCollateral,
                        ilkDebtAvailable,
                        debtFloor,
                        liquidationRatio,
                        proxyAddress,
                        allowance,
                        safeConfirmations: context.safeConfirmations,
                        etherscan: context.etherscan.url,
                        allowanceAmount: maxUint256,

                        injectStateOverride,
                      }

                      const environmentChanges$ = merge(
                        priceInfoChange$(priceInfo$, token),
                        balanceInfoChange$(balanceInfo$, token, account),
                        createIlkDataChange$(ilkData$, ilk),
                      )

                      const connectedProxyAddress$ = proxyAddress$(account)

                      return merge(change$, environmentChanges$).pipe(
                        scan(apply, initialState),
                        map(validateErrors),
                        map(validateWarnings),
                        map(curry(addTransitions)(txHelpers, connectedProxyAddress$, change)),
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
