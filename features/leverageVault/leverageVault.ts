import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { BalanceInfo, balanceInfoChange$ } from 'features/shared/balanceInfo'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { curry } from 'lodash'
import { combineLatest, iif, merge, Observable, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { applyOpenVaultAllowance, OpenVaultAllowanceChange } from './leverageVaultAllowances'
import {
  applyOpenVaultCalculations,
  defaultOpenVaultStateCalculations,
  LeverageVaultCalculations,
} from './leverageVaultCalculations'
import {
  applyOpenVaultConditions,
  applyOpenVaultStageCategorisation,
  defaultOpenVaultConditions,
  LeverageVaultConditions,
} from './leverageVaultConditions'
import { applyOpenVaultEnvironment, OpenVaultEnvironmentChange } from './leverageVaultEnvironment'
import { applyOpenVaultInput, OpenVaultInputChange } from './leverageVaultInput'
import {
  applyOpenVaultSummary,
  defaultOpenVaultSummary,
  OpenVaultSummary,
} from './leverageVaultSummary'
import {
  applyLeverageVaultTransaction,
  createProxy,
  leverageVault,
  OpenVaultTransactionChange,
  setAllowance,
} from './leverageVaultTransactions'
import { applyOpenVaultTransition, OpenVaultTransitionChange } from './leverageVaultTransitions'
import {
  LeverageVaultErrorMessage,
  LeverageVaultWarningMessage,
  validateErrors,
  validateWarnings,
} from './leverageVaultValidations'

interface OpenVaultInjectedOverrideChange {
  kind: 'injectStateOverride'
  stateToOverride: Partial<LeverageVaultState>
}

function applyOpenVaultInjectedOverride(change: LeverageVaultChange, state: LeverageVaultState) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type LeverageVaultChange =
  | OpenVaultInputChange
  | OpenVaultTransitionChange
  | OpenVaultTransactionChange
  | OpenVaultAllowanceChange
  | OpenVaultEnvironmentChange
  | OpenVaultInjectedOverrideChange

function apply(state: LeverageVaultState, change: LeverageVaultChange) {
  const s1 = applyOpenVaultInput(change, state)

  const s3 = applyOpenVaultTransition(change, s1)
  const s4 = applyLeverageVaultTransaction(change, s3)
  const s5 = applyOpenVaultAllowance(change, s4)
  const s6 = applyOpenVaultEnvironment(change, s5)
  const s7 = applyOpenVaultInjectedOverride(change, s6)
  const s8 = applyOpenVaultCalculations(s7)
  const s9 = applyOpenVaultStageCategorisation(s8)
  const s10 = applyOpenVaultConditions(s9)
  return applyOpenVaultSummary(s10)
}

export type LeverageVaultStage =
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

export interface MutableLeverageVaultState {
  stage: LeverageVaultStage
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  leverage?: BigNumber
  selectedAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  allowanceAmount?: BigNumber
  id?: BigNumber
}

interface LeverageVaultFunctions {
  progress?: () => void
  regress?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateLeverage?: (leverage?: BigNumber) => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  injectStateOverride: (state: Partial<MutableLeverageVaultState>) => void
}

interface LeverageVaultEnvironment {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
}

interface LeverageVaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  txError?: any
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type LeverageVaultState = MutableLeverageVaultState &
  LeverageVaultCalculations &
  LeverageVaultFunctions &
  LeverageVaultEnvironment &
  LeverageVaultConditions &
  LeverageVaultTxInfo & {
    errorMessages: LeverageVaultErrorMessage[]
    warningMessages: LeverageVaultWarningMessage[]
    summary: OpenVaultSummary
  }

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: LeverageVaultChange) => void,
  state: LeverageVaultState,
): LeverageVaultState {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => {
        change({ kind: 'deposit', depositAmount })
      },
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateLeverage: (leverage?: BigNumber) => {
        change({ kind: 'leverage', leverage })
      },
      progress: () => change({ kind: 'progressEditing' }),
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

  if (state.stage === 'openWaitingForConfirmation' || state.stage === 'openFailure') {
    return {
      ...state,
      progress: () => leverageVault(txHelpers, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'openSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'backToEditing',
        }),
    }
  }

  return state
}

export const defaultMutableOpenVaultState: MutableLeverageVaultState = {
  stage: 'editing' as LeverageVaultStage,
  selectedAllowanceRadio: 'unlimited' as 'unlimited',
  allowanceAmount: maxUint256,
}

export function createLeverageVault$(
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
): Observable<LeverageVaultState> {
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
              switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) =>
                ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
                  first(),
                  switchMap((allowance) => {
                    const change$ = new Subject<LeverageVaultChange>()

                    function change(ch: LeverageVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(
                      stateToOverride: Partial<MutableLeverageVaultState>,
                    ) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    const initialState: LeverageVaultState = {
                      ...defaultMutableOpenVaultState,
                      ...defaultOpenVaultStateCalculations,
                      ...defaultOpenVaultConditions,
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      safeConfirmations: context.safeConfirmations,
                      etherscan: context.etherscan.url,
                      errorMessages: [],
                      warningMessages: [],
                      summary: defaultOpenVaultSummary,
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
