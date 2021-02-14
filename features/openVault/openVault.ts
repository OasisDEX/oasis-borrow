import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData, maxUint256 } from 'blockchain/calls/erc20'
import { lockAndDraw } from 'blockchain/calls/lockAndDraw'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { LockAndDrawData } from 'features/deposit/deposit'
import { applyChange, ApplyChange, Change, Changes, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry, isEqual } from 'lodash'
import { Observable, of, iif, combineLatest, merge, Subject } from 'rxjs'
import {
  startWith,
  switchMap,
  map,
  scan,
  shareReplay,
  filter,
  first,
  distinctUntilChanged,
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

function applyIsStageStates(state: OpenVaultState): OpenVaultState {
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
  }
}

function applyVaultCalculations(state: OpenVaultState): OpenVaultState {
  const {
    collateralBalance,
    depositAmount,
    maxDebtPerUnitCollateral,
    generateAmount,
    collateralPrice,
    liquidationRatio,
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)
  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const depositAmountUSD = depositAmount ? collateralPrice.times(depositAmount) : zero
  const generateAmountUSD = generateAmount ? generateAmount : zero // 1 DAI === 1 USD

  const collateralizationRatio = generateAmountUSD.eq(zero)
    ? zero
    : depositAmountUSD.div(generateAmountUSD)

  const liquidationPrice =
    generateAmount && depositAmount && depositAmount.gt(zero)
      ? generateAmount.times(liquidationRatio).div(depositAmount)
      : zero

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    collateralizationRatio,
    liquidationPrice,
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
    collateralizationRatio,
    liquidationRatio,
  } = state

  const errorMessages: OpenVaultErrorMessage[] = []

  if (depositAmount?.gt(maxDepositAmount)) {
    errorMessages.push({ kind: 'depositAmountGreaterThanMaxDepositAmount' })
  }

  if (generateAmount?.lt(debtFloor)) {
    errorMessages.push({ kind: 'generateAmountLessThanDebtFloor' })
  }

  if (generateAmount?.gt(ilkDebtAvailable)) {
    errorMessages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  if (allowanceAmount?.gt(maxUint256)) {
    errorMessages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  if (generateAmount?.gt(zero) && collateralizationRatio.lt(liquidationRatio)) {
    errorMessages.push({ kind: 'vaultUnderCollateralized' })
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
    warningMessages.push({ kind: 'potentialGenerateAmountLessThanDebtFloor' })
  }

  if (!proxyAddress) {
    warningMessages.push({ kind: 'noProxyAddress' })
  }

  if (!depositAmount) {
    warningMessages.push({ kind: 'depositAmountEmpty' })
  }

  if (!generateAmount) {
    warningMessages.push({ kind: 'generateAmountEmpty' })
  }

  if (token !== 'ETH') {
    if (!allowance) {
      warningMessages.push({ kind: 'noAllowance' })
    }
    if (depositAmount && allowance && depositAmount.gt(allowance)) {
      warningMessages.push({ kind: 'allowanceLessThanDepositAmount' })
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

type OpenVaultErrorMessage = {
  kind:
    | 'depositAmountGreaterThanMaxDepositAmount'
    | 'generateAmountLessThanDebtFloor'
    | 'generateAmountGreaterThanDebtCeiling'
    | 'allowanceAmountGreaterThanMaxUint256'
    | 'vaultUnderCollateralized'
}

type OpenVaultWarningMessage = {
  kind:
    | 'potentialGenerateAmountLessThanDebtFloor'
    | 'depositAmountEmpty'
    | 'generateAmountEmpty'
    | 'noProxyAddress'
    | 'noAllowance'
    | 'allowanceLessThanDepositAmount'
}

export type OpenVaultStage =
  | 'ilkValidationLoading'
  | 'ilkValidationFailure'
  | 'ilkValidationSuccess'
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

export interface OpenVaultState {
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

  // Account Balance & Price Info
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber

  // Vault Display Information
  liquidationPrice: BigNumber
  afterLiquidationPrice: BigNumber
  collateralizationRatio: BigNumber
  afterCollateralizationRatio: BigNumber
  lockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber

  // Form Values
  depositAmount?: BigNumber
  generateAmount?: BigNumber
  allowanceAmount?: BigNumber

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
  send(lockAndDraw, {
    kind: TxMetaKind.lockAndDraw,
    drawAmount: generateAmount || new BigNumber(0),
    lockAmount: depositAmount || new BigNumber(0),
    proxyAddress: proxyAddress!,
    ilk,
    tkn: token,
  })
    .pipe(
      transactionToX<OpenVaultChange, LockAndDrawData>(
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

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
  ilkToToken$: Observable<(ilk: string) => string>,
  ilk: string,
): Observable<OpenVaultState> {
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

              const userTokenInfo$ = combineLatest(
                balance$(token, account),
                tokenOraclePrice$(token),
                balance$('ETH', account),
                tokenOraclePrice$('ETH'),
                balance$('DAI', account),
              ).pipe(
                switchMap(
                  ([collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance]) =>
                    of({
                      collateralBalance,
                      collateralPrice,
                      ethBalance,
                      ethPrice,
                      daiBalance,
                    }),
                ),
              )

              return combineLatest(userTokenInfo$, ilkData$(ilk), proxyAddress$(account)).pipe(
                first(),
                switchMap(
                  ([
                    { collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance },
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
                          stage: 'editing',
                          token,
                          account,
                          collateralBalance,
                          collateralPrice,
                          ethBalance,
                          ethPrice,
                          daiBalance,
                          errorMessages: [],
                          warningMessages: [],
                          depositAmount: undefined,
                          generateAmount: undefined,
                          maxDepositAmount: zero,
                          maxGenerateAmount: zero,
                          depositAmountUSD: zero,
                          generateAmountUSD: zero,
                          maxDepositAmountUSD: zero,
                          liquidationPrice: zero,
                          afterLiquidationPrice: zero,
                          collateralizationRatio: zero,
                          afterCollateralizationRatio: zero,
                          lockedCollateral: zero,
                          lockedCollateralUSD: zero,
                          ilk,
                          maxDebtPerUnitCollateral,
                          ilkDebtAvailable,
                          debtFloor,
                          liquidationRatio,
                          proxyAddress,
                          allowance,
                          safeConfirmations: context.safeConfirmations,
                          etherscan: context.etherscan.url,
                        }

                        const change$ = new Subject<OpenVaultChange>()

                        function change(ch: OpenVaultChange) {
                          change$.next(ch)
                        }

                        const collateralBalanceChange$ = balance$(token, account!).pipe(
                          map((collateralBalance) => ({
                            kind: 'collateralBalance',
                            collateralBalance,
                          })),
                        )

                        const ethBalanceChange$ = balance$('ETH', account!).pipe(
                          map((ethBalance) => ({ kind: 'ethBalance', ethBalance })),
                        )

                        const daiBalanceChange$ = balance$('DAI', account!).pipe(
                          map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
                        )

                        const maxDebtPerUnitCollateralChange$ = ilkData$(ilk).pipe(
                          map(({ maxDebtPerUnitCollateral }) => ({
                            kind: 'maxDebtPerUnitCollateral',
                            maxDebtPerUnitCollateral,
                          })),
                        )

                        const ilkDebtAvailableChange$ = ilkData$(ilk).pipe(
                          map(({ ilkDebtAvailable }) => ({
                            kind: 'ilkDebtAvailable',
                            ilkDebtAvailable,
                          })),
                        )

                        const debtFloorChange$ = ilkData$(ilk).pipe(
                          map(({ debtFloor }) => ({
                            kind: 'debtFloor',
                            debtFloor,
                          })),
                        )

                        const collateralPriceChange$ = tokenOraclePrice$(ilk).pipe(
                          map((collateralPrice) => ({ kind: 'collateralPrice', collateralPrice })),
                        )

                        const environmentChanges$ = merge(
                          collateralPriceChange$,
                          collateralBalanceChange$,
                          ethBalanceChange$,
                          daiBalanceChange$,
                          maxDebtPerUnitCollateralChange$,
                          ilkDebtAvailableChange$,
                          debtFloorChange$,
                        )

                        const connectedProxyAddress$ = proxyAddress$(account)

                        const connectedAllowance$ = connectedProxyAddress$.pipe(
                          switchMap((proxyAddress) =>
                            proxyAddress ? allowance$(token, account, proxyAddress) : of(zero),
                          ),
                          distinctUntilChanged(isEqual),
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
