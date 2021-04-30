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

import { applyOpenVaultAllowance, OpenVaultAllowanceChange } from './openVaultAllowances'
import {
  applyOpenVaultCalculations,
  defaultOpenVaultStateCalculations,
  OpenVaultCalculations,
} from './openVaultCalculations'
import {
  applyOpenVaultConditions,
  applyOpenVaultStageCategorisation,
  defaultOpenVaultConditions,
  OpenVaultConditions,
} from './openVaultConditions'
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
  const s8 = applyOpenVaultCalculations(s7)
  const s9 = applyOpenVaultStageCategorisation(s8)
  return applyOpenVaultConditions(s9)
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

export interface MutableOpenVaultState {
  stage: OpenVaultStage
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
  generateAmount?: BigNumber
  showGenerateOption: boolean
  selectedAllowanceRadio: 'unlimited' | 'depositAmount' | 'custom'
  allowanceAmount?: BigNumber
  id?: BigNumber
}

interface OpenVaultFunctions {
  progress?: () => void
  regress?: () => void
  toggleGenerateOption?: () => void
  updateDeposit?: (depositAmount?: BigNumber) => void
  updateDepositUSD?: (depositAmountUSD?: BigNumber) => void
  updateDepositMax?: () => void
  updateGenerate?: (generateAmount?: BigNumber) => void
  updateGenerateMax?: () => void
  updateAllowanceAmount?: (amount?: BigNumber) => void
  setAllowanceAmountUnlimited?: () => void
  setAllowanceAmountToDepositAmount?: () => void
  setAllowanceAmountCustom?: () => void
  injectStateOverride: (state: Partial<MutableOpenVaultState>) => void
}

interface OpenVaultEnvironment {
  ilk: string
  account: string
  token: string
  priceInfo: PriceInfo
  balanceInfo: BalanceInfo
  ilkData: IlkData
  proxyAddress?: string
  allowance?: BigNumber
}

interface OpenVaultTxInfo {
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  txError?: any
  etherscan?: string
  proxyConfirmations?: number
  safeConfirmations: number
}

export type OpenVaultState = MutableOpenVaultState &
  OpenVaultCalculations &
  OpenVaultFunctions &
  OpenVaultEnvironment &
  OpenVaultConditions &
  OpenVaultTxInfo & {
    errorMessages: OpenVaultErrorMessage[]
    warningMessages: OpenVaultWarningMessage[]
  }

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
      progress: () => openVault(txHelpers, change, state),
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

export const defaultMutableOpenVaultState: MutableOpenVaultState = {
  stage: 'editing' as OpenVaultStage,
  showGenerateOption: false,
  selectedAllowanceRadio: 'unlimited' as 'unlimited',
  allowanceAmount: maxUint256,
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
              switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) =>
                ((proxyAddress && allowance$(token, account, proxyAddress)) || of(undefined)).pipe(
                  first(),
                  switchMap((allowance) => {
                    const change$ = new Subject<OpenVaultChange>()

                    function change(ch: OpenVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(stateToOverride: Partial<MutableOpenVaultState>) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    const initialState: OpenVaultState = {
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
