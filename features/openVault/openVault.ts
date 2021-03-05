import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData, maxUint256 } from 'blockchain/calls/erc20'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { open, OpenData } from 'blockchain/calls/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { UserTokenInfo, userTokenInfoChange$ } from 'features/shared/userTokenInfo'
import { ApplyChange, applyChange, Change, Changes, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
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

interface Receipt {
  logs: { topics: string[] | undefined }[]
}

function parseVaultIdFromReceiptLogs({ logs }: Receipt): number {
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
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(currentCollateralPrice)
  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const depositAmountUSD = depositAmount ? currentCollateralPrice.times(depositAmount) : zero
  const generateAmountUSD = generateAmount || zero // 1 DAI === 1 USD

  const afterCollateralizationRatio = generateAmountUSD.eq(zero)
    ? zero
    : depositAmountUSD.div(generateAmountUSD)

  const afterLiquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? generateAmount.times(liquidationRatio).div(depositAmount)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    depositAmountUSD,
    generateAmountUSD,
    maxDepositAmountUSD,
  }
}

function validateErrors(state: OpenVaultState): OpenVaultState {
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

function validateWarnings(state: OpenVaultState): OpenVaultState {
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

  if (depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
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
    if (!allowance) {
      warningMessages.push('noAllowance')
    }
    if (depositAmount && allowance && depositAmount.gt(allowance)) {
      warningMessages.push('allowanceLessThanDepositAmount')
    }
  }

  return { ...state, warningMessages }
}

type OpenVaultChange = Changes<OpenVaultState>

export type ManualChange =
  | Change<OpenVaultState, 'depositAmount'>
  | Change<OpenVaultState, 'generateAmount'>
  | Change<OpenVaultState, 'allowanceAmount'>

const apply: ApplyChange<OpenVaultState> = applyChange

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

export type OpenVaultState = UserTokenInfo & {
  // Basic States
  stage: OpenVaultStage
  ilk: string
  account: string
  token: string

  // validation
  errorMessages: OpenVaultErrorMessage[]
  warningMessages: OpenVaultWarningMessage[]

  // Dynamic Data
  proxyAddress?: string
  allowance?: BigNumber
  progress?: () => void
  reset?: () => void
  change?: (change: ManualChange) => void
  id?: number
  depositAmount?: BigNumber
  generateAmount?: BigNumber
  allowanceAmount?: BigNumber

  // Vault Display Information
  afterLiquidationPrice: BigNumber
  afterCollateralizationRatio: BigNumber

  // Form Bound Values
  maxDepositAmount: BigNumber
  maxGenerateAmount: BigNumber
  depositAmountUSD: BigNumber
  generateAmountUSD: BigNumber
  maxDepositAmountUSD: BigNumber

  // Ilk information
  maxDebtPerUnitCollateral: BigNumber // Updates
  ilkDebtAvailable: BigNumber // Updates
  debtFloor: BigNumber
  liquidationRatio: BigNumber

  // IsStage states
  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  // TransactionInfo
  allowanceTxHash?: string
  proxyTxHash?: string
  openTxHash?: string
  proxyConfirmations?: number
  safeConfirmations: number
  txError?: any
  etherscan?: string
}

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
  // function backToOpenVaultModalEditing() {
  //   change({ kind: 'stage', stage: 'editing' })
  // }

  function reset() {
    change({ kind: 'stage', stage: 'editing' })
    change({ kind: 'depositAmount', depositAmount: undefined })
    change({ kind: 'generateAmount', generateAmount: undefined })
    change({ kind: 'allowanceAmount', allowanceAmount: maxUint256 })
  }

  function progressEditing() {
    const canProgress = !state.errorMessages.length
    const hasProxy = !!state.proxyAddress

    const openingEmptyVault = state.depositAmount ? state.depositAmount.eq(zero) : true
    const depositAmountLessThanAllowance =
      state.allowance && state.depositAmount && state.allowance.gte(state.depositAmount)

    const hasAllowance =
      state.token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

    if (canProgress) {
      if (!hasProxy) {
        change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
      } else if (!hasAllowance) {
        change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' })
      } else change({ kind: 'stage', stage: 'openWaitingForConfirmation' })
    }
  }

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      reset,
      progress: progressEditing,
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
          kind: 'stage',
          stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
        }),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
    return {
      ...state,
      change,
      progress: () => setAllowance(txHelpers, allowance$, change, state),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  if (state.stage === 'allowanceSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'stage',
          stage: 'editing',
        }),
    }
  }

  if (state.stage === 'openWaitingForConfirmation' || state.stage === 'openFailure') {
    return {
      ...state,
      progress: () => openVault(txHelpers, change, state),
      reset: () => change({ kind: 'stage', stage: 'editing' }),
    }
  }

  return state
}

function ilkDataChange$<T extends keyof IlkData>(ilkData$: Observable<IlkData>, kind: T) {
  return ilkData$.pipe(
    map((ilkData) => ({
      kind,
      [kind]: ilkData[kind],
    })),
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
                        const initialState: OpenVaultState = {
                          ...defaultIsStates,
                          ...userTokenInfo,
                          stage: 'editing',
                          token,
                          account,
                          errorMessages: [],
                          warningMessages: [],
                          depositAmount: undefined,
                          generateAmount: undefined,
                          maxDepositAmount: zero,
                          maxGenerateAmount: zero,
                          depositAmountUSD: zero,
                          generateAmountUSD: zero,
                          maxDepositAmountUSD: zero,
                          afterLiquidationPrice: zero,
                          afterCollateralizationRatio: zero,
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

                        const environmentChanges$ = merge(
                          userTokenInfoChange$(userTokenInfo$(token, account), 'collateralBalance'),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'ethBalance'),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'daiBalance'),
                          userTokenInfoChange$(
                            userTokenInfo$(token, account),
                            'currentCollateralPrice',
                          ),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'currentEthPrice'),
                          userTokenInfoChange$(
                            userTokenInfo$(token, account),
                            'nextCollateralPrice',
                          ),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'nextEthPrice'),
                          userTokenInfoChange$(
                            userTokenInfo$(token, account),
                            'dateLastCollateralPrice',
                          ),
                          userTokenInfoChange$(
                            userTokenInfo$(token, account),
                            'dateNextCollateralPrice',
                          ),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'dateLastEthPrice'),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'dateNextEthPrice'),
                          userTokenInfoChange$(
                            userTokenInfo$(token, account),
                            'isStaticCollateralPrice',
                          ),
                          userTokenInfoChange$(userTokenInfo$(token, account), 'isStaticEthPrice'),

                          ilkDataChange$(ilkData$(ilk), 'maxDebtPerUnitCollateral'),
                          ilkDataChange$(ilkData$(ilk), 'ilkDebtAvailable'),
                          ilkDataChange$(ilkData$(ilk), 'debtFloor'),
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
