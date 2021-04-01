import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { createUserTokenInfoChange$, UserTokenInfo } from 'features/shared/userTokenInfo'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { combineLatest, iif, merge, Observable, of, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  first,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators'

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

const defaultIsStates = {
  isIlkValidationStage: false,
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

function applyIsStageStates(
  state: IlkValidationState | OpenVaultState,
): IlkValidationState | OpenVaultState {
  const newState = {
    ...state,
    ...defaultIsStates,
  }

  switch (state.stage) {
    case 'ilkValidationFailure':
    case 'ilkValidationLoading':
    case 'ilkValidationSuccess':
      return {
        ...newState,
        isIlkValidationStage: true,
      }
    case 'editing':
      return {
        ...newState,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...newState,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return {
        ...newState,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openSuccess':
      return {
        ...newState,
        isOpenStage: true,
      }
    default:
      return state
  }
}

function applyVaultCalculations(state: OpenVaultState): OpenVaultState {
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
  // must call applyVaultCalculations before each change so that the state in
  // context of the scan aligns with the previous pipeline propagation
  const s1 = applyOpenVaultInput(change, applyVaultCalculations(state))
  const s2 = applyOpenVaultForm(change, s1)
  const s3 = applyOpenVaultTransition(change, s2)
  const s4 = applyOpenVaultTransaction(change, s3)
  const s5 = applyOpenVaultAllowance(change, s4)
  const s6 = applyOpenVaultEnvironment(change, s5)
  return applyOpenVaultInjectedOverride(change, s6)
}

export type IlkValidationStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'

export interface IlkValidationState {
  stage: IlkValidationStage
  ilk: string

  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
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

  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string

  injectStateOverride: (state: Partial<OpenVaultState>) => void
}

export type OpenVaultState = UserTokenInfo & DefaultOpenVaultState

function addTransitions(
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<BigNumber>,
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

      progress: () => setAllowance(txHelpers, allowance$, change, state),
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

function createIlkValidation$(ilks$: Observable<string[]>, ilk: string) {
  return ilks$.pipe(
    switchMap((ilks) => {
      const isValidIlk = ilks.some((i) => i === ilk)
      if (!isValidIlk) {
        return of({
          ilk,
          stage: 'ilkValidationFailure',
        })
      }
      return of({
        ilk,
        stage: 'ilkValidationSuccess',
      })
    }),
    startWith({ ilk, stage: 'ilkValidationLoading' }),
  )
}

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  userTokenInfo$: (token: string, account: string) => Observable<UserTokenInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<IlkValidationState | OpenVaultState> {
  return createIlkValidation$(ilks$, ilk).pipe(
    switchMap((state) => {
      return iif(
        () => state.stage !== 'ilkValidationSuccess',
        of(state),
        combineLatest(context$, txHelpers$, ilkToToken$).pipe(
          switchMap(([context, txHelpers, ilkToToken]) => {
            const account = context.account
            const token = ilkToToken(ilk)
            return combineLatest(
              userTokenInfo$(token, account),
              ilkData$(ilk),
              proxyAddress$(account),
            ).pipe(
              first(),
              switchMap(
                ([
                  userTokenInfo,
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
                        if (ch.kind === 'injectStateOverride') {
                          throw new Error("don't use injected overrides")
                        }
                        change$.next(ch)
                      }

                      // NOTE: Not to be used in production/dev, test only
                      function injectStateOverride(stateToOverride: Partial<OpenVaultState>) {
                        return change$.next({ kind: 'injectStateOverride', stateToOverride })
                      }

                      const initialState: OpenVaultState = {
                        ...userTokenInfo,
                        ...defaultIsStates,

                        stage: 'editing',
                        errorMessages: [],
                        warningMessages: [],
                        showIlkDetails: false,
                        showGenerateOption: false,
                        afterLiquidationPrice: zero,
                        afterCollateralizationRatio: zero,
                        maxDepositAmount: zero,
                        maxDepositAmountUSD: zero,
                        maxGenerateAmount: zero,

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

                      const userTokenInfoChange$ = curry(createUserTokenInfoChange$)(userTokenInfo$)
                      const ilkDataChange$ = curry(createIlkDataChange$)(ilkData$)

                      const environmentChanges$ = merge(
                        userTokenInfoChange$(token, account),
                        ilkDataChange$(ilk),
                      )

                      const connectedProxyAddress$ = proxyAddress$(account)

                      const connectedAllowance$ = connectedProxyAddress$.pipe(
                        switchMap((proxyAddress) =>
                          proxyAddress ? allowance$(token, account, proxyAddress) : of(zero),
                        ),
                        distinctUntilChanged((x, y) => x.eq(y)),
                      )

                      return merge(change$, environmentChanges$).pipe(
                        scan(apply, initialState),
                        map(applyVaultCalculations),
                        map(validateErrors),
                        map(validateWarnings),
                        map(
                          curry(addTransitions)(
                            txHelpers,
                            connectedProxyAddress$,
                            connectedAllowance$,
                            change,
                          ),
                        ),
                      )
                    }),
                  ),
              ),
            )
          }),
        ),
      )
    }),
    map(applyIsStageStates),
    shareReplay(1),
  )
}
