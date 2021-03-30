import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData, maxUint256 } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { open, OpenData } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { createUserTokenInfoChange$, UserTokenInfo } from 'features/shared/userTokenInfo'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { compose } from 'ramda'
import { combineLatest, iif, merge, Observable, of, Subject } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators'
import Web3 from 'web3'

import { applyOpenVaultEnvironment, OpenVaultEnvironmentChange } from './openVaultEnvironment'
import { applyOpenVaultForm, OpenVaultFormChange } from './openVaultForm'
import { applyOpenVaultInput, OpenVaultInputChange } from './openVaultInput'
import { applyOpenVaultTransition, OpenVaultTransitionChange } from './openVaultTransitions'

interface Receipt {
  logs: { topics: string[] | undefined }[]
}

export function parseVaultIdFromReceiptLogs({ logs }: Receipt): number | undefined {
  const newCdpEventTopic = Web3.utils.keccak256('NewCdp(address,address,uint256)')
  return logs
    .filter((log) => {
      if (log.topics) {
        return log.topics[0] === newCdpEventTopic
      }
      return false
    })
    .map(({ topics }) => {
      return Web3.utils.hexToNumber(topics![3])
    })[0]
}

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
    generateAmount && !generateAmount.eq(zero) ? depositAmountUSD.div(generateAmount) : zero

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

export function validateErrors(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    maxDepositAmount,
    generateAmount,
    allowanceAmount,
    debtFloor,
    ilkDebtAvailable,
    afterCollateralizationRatio,
    liquidationRatio,
    stage,
  } = state

  const errorMessages: OpenVaultErrorMessage[] = []

  if (depositAmount?.gt(maxDepositAmount)) {
    errorMessages.push('depositAmountGreaterThanMaxDepositAmount')
  }

  if (generateAmount?.lt(debtFloor)) {
    errorMessages.push('generateAmountLessThanDebtFloor')
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push('generateAmountGreaterThanDebtCeiling')
  }

  if (stage === 'allowanceWaitingForConfirmation' || stage === 'allowanceFailure') {
    if (!allowanceAmount) {
      errorMessages.push('allowanceAmountEmpty')
    }
    if (allowanceAmount?.gt(maxUint256)) {
      errorMessages.push('customAllowanceAmountGreaterThanMaxUint256')
    }
    if (depositAmount && allowanceAmount && allowanceAmount.lt(depositAmount)) {
      errorMessages.push('customAllowanceAmountLessThanDepositAmount')
    }
  }

  if (generateAmount?.gt(zero) && afterCollateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push('vaultUnderCollateralized')
  }

  return { ...state, errorMessages }
}

export function validateWarnings(state: OpenVaultState): OpenVaultState {
  const {
    allowance,
    depositAmount,
    generateAmount,
    depositAmountUSD,
    debtFloor,
    proxyAddress,
    token,
  } = state

  const warningMessages: OpenVaultWarningMessage[] = []

  if (depositAmountUSD && depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
    warningMessages.push('potentialGenerateAmountLessThanDebtFloor')
  }

  if (!proxyAddress) {
    warningMessages.push('noProxyAddress')
  }

  if (!depositAmount) {
    warningMessages.push('depositAmountEmpty')
  }

  if (!generateAmount) {
    warningMessages.push('generateAmountEmpty')
  }

  if (token !== 'ETH') {
    if (!allowance || !allowance.gt(zero)) {
      warningMessages.push('noAllowance')
    }
    if (depositAmount && allowance && depositAmount.gt(allowance)) {
      warningMessages.push('allowanceLessThanDepositAmount')
    }
  }

  return { ...state, warningMessages }
}

export type OpenVaultChange =
  | OpenVaultInputChange
  | OpenVaultFormChange
  | OpenVaultTransitionChange
  | OpenVaultEnvironmentChange

function apply(state: OpenVaultState, change: OpenVaultChange) {
  const s1 = applyOpenVaultInput(change, state)
  const s2 = applyOpenVaultForm(change, s1)
  const s3 = applyOpenVaultTransition(change, s2)
  return applyOpenVaultEnvironment(change, s3)
}

type OpenVaultErrorMessage =
  | 'depositAmountGreaterThanMaxDepositAmount'
  | 'generateAmountLessThanDebtFloor'
  | 'generateAmountGreaterThanDebtCeiling'
  | 'vaultUnderCollateralized'
  | 'allowanceAmountEmpty'
  | 'customAllowanceAmountGreaterThanMaxUint256'
  | 'customAllowanceAmountLessThanDepositAmount'

type OpenVaultWarningMessage =
  | 'potentialGenerateAmountLessThanDebtFloor'
  | 'depositAmountEmpty'
  | 'generateAmountEmpty'
  | 'noProxyAddress'
  | 'noAllowance'
  | 'allowanceLessThanDepositAmount'

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

  updateDeposit: (depositAmount?: BigNumber) => void
  updateDepositUSD: (depositAmountUSD?: BigNumber) => void
  updateDepositMax: () => void
  updateGenerate: (generateAmount?: BigNumber) => void
  updateGenerateMax: () => void

  toggleGenerateOption?: () => void
  toggleIlkDetails: () => void
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
  allowanceAmount?: BigNumber

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
}

export type OpenVaultState = UserTokenInfo & DefaultOpenVaultState

function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  allowance$: Observable<BigNumber>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
) {
  sendWithGasEstimation(approve, {
    kind: TxMetaKind.approve,
    token: state.token,
    spender: state.proxyAddress!,
    amount: state.allowanceAmount!,
  })
    .pipe(
      transactionToX<OpenVaultChange, ApproveData>(
        { kind: 'stage', stage: 'allowanceWaitingForApproval' },
        (txState) =>
          of(
            {
              kind: 'allowanceTxHash',
              allowanceTxHash: (txState as any).txHash as string,
            },
            { kind: 'stage', stage: 'allowanceInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'allowanceFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        () =>
          allowance$.pipe(
            switchMap((allowance) =>
              of({ kind: 'allowance', allowance }, { kind: 'stage', stage: 'allowanceSuccess' }),
            ),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function createProxy(
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
  { safeConfirmations }: OpenVaultState,
) {
  sendWithGasEstimation(createDsProxy, { kind: TxMetaKind.createDsProxy })
    .pipe(
      transactionToX<OpenVaultChange, CreateDsProxyData>(
        { kind: 'stage', stage: 'proxyWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'proxyTxHash', proxyTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'proxyInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'proxyFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        (txState) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => !!proxyAddress),
            switchMap((proxyAddress) =>
              iif(
                () => (txState as any).confirmations < safeConfirmations,
                of({
                  kind: 'proxyConfirmations',
                  proxyConfirmations: (txState as any).confirmations,
                }),
                of(
                  { kind: 'proxyAddress', proxyAddress: proxyAddress! },
                  {
                    kind: 'stage',
                    stage: 'proxySuccess',
                  },
                ),
              ),
            ),
          )
        },
        safeConfirmations,
      ),
    )
    .subscribe((ch) => change(ch))
}

function openVault(
  { send }: TxHelpers,
  change: (ch: OpenVaultChange) => void,
  { generateAmount, depositAmount, proxyAddress, ilk, token }: OpenVaultState,
) {
  send(open, {
    kind: TxMetaKind.open,
    generateAmount: generateAmount || zero,
    depositAmount: depositAmount || zero,
    proxyAddress: proxyAddress!,
    ilk,
    token,
  })
    .pipe(
      transactionToX<OpenVaultChange, OpenData>(
        { kind: 'stage', stage: 'openWaitingForApproval' },
        (txState) =>
          of(
            { kind: 'openTxHash', openTxHash: (txState as any).txHash as string },
            { kind: 'stage', stage: 'openInProgress' },
          ),
        (txState) => {
          return of(
            {
              kind: 'stage',
              stage: 'openFailure',
            },
            {
              kind: 'txError',
              txError:
                txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                  ? txState.error
                  : undefined,
            },
          )
        },
        (txState) => {
          const id = parseVaultIdFromReceiptLogs(
            txState.status === TxStatus.Success && txState.receipt,
          )
          return of({ kind: 'stage', stage: 'openSuccess' }, { kind: 'id', id })
        },
      ),
    )
    .subscribe((ch) => change(ch))
}

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

export const defaultOpenVaultState: DefaultOpenVaultState = {
  ...defaultIsStates,
  stage: 'editing',
  token: '',
  account: '',
  errorMessages: [],
  warningMessages: [],
  depositAmount: undefined,
  generateAmount: undefined,
  maxDepositAmount: zero,
  maxGenerateAmount: zero,
  depositAmountUSD: zero,
  maxDepositAmountUSD: zero,
  afterLiquidationPrice: zero,
  afterCollateralizationRatio: zero,
  ilk: '',
  maxDebtPerUnitCollateral: zero,
  ilkDebtAvailable: zero,
  debtFloor: zero,
  liquidationRatio: zero,
  allowance: zero,
  safeConfirmations: 0,
  allowanceAmount: maxUint256,
}

export function createOpenVault$(
  defaultState$: Observable<DefaultOpenVaultState>,
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
  return ilks$
    .pipe(
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
    .pipe(
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
                defaultState$,
                ilkData$(ilk),
                proxyAddress$(account),
              ).pipe(
                first(),
                switchMap(
                  ([
                    userTokenInfo,
                    defaultState,
                    { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                    proxyAddress,
                  ]) =>
                    (
                      (proxyAddress && allowance$(token, account, proxyAddress)) ||
                      of(undefined)
                    ).pipe(
                      first(),
                      switchMap((allowance) => {
                        const initialState: OpenVaultState = {
                          ...userTokenInfo,
                          ...defaultState,
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
                        }

                        const change$ = new Subject<OpenVaultChange>()

                        function change(ch: OpenVaultChange) {
                          change$.next(ch)
                        }

                        const userTokenInfoChange$ = curry(createUserTokenInfoChange$)(
                          userTokenInfo$,
                        )
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
                          shareReplay(1),
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
    )
}
