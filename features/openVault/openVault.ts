import { TxStatus } from '@oasisdex/transactions'
import { BigNumber } from 'bignumber.js'
import { approve, ApproveData } from 'blockchain/calls/erc20'
import { lockAndDraw } from 'blockchain/calls/lockAndDraw'
import { createDsProxy, CreateDsProxyData } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { IlkData } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { LockAndDrawData } from 'features/deposit/deposit'
import { applyChange, ApplyChange, Change, Changes, transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { Observable, of, iif, combineLatest, merge, Subject } from 'rxjs'
import { startWith, switchMap, map, scan, shareReplay, filter } from 'rxjs/operators'
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
  } = state

  const maxDepositAmount = collateralBalance
  const maxDepositAmountUSD = collateralBalance.times(collateralPrice)
  const maxGenerateAmount = depositAmount ? depositAmount.times(maxDebtPerUnitCollateral) : zero
  const depositAmountUSD = depositAmount ? collateralPrice.times(depositAmount) : zero
  const generateAmountUSD = generateAmount ? generateAmount : zero // 1 DAI === 1 USD

  const collateralizationRatio = generateAmountUSD.eq(zero)
    ? zero
    : depositAmountUSD.div(generateAmountUSD)

  return {
    ...state,
    maxDepositAmount,
    maxGenerateAmount,
    collateralizationRatio,
    depositAmountUSD,
    generateAmountUSD,
    maxDepositAmountUSD,
  }
}

function validate(state: OpenVaultState): OpenVaultState {
  const {
    depositAmount,
    maxDepositAmount,
    depositAmountUSD,
    generateAmount,
    debtFloor,
    ilkDebtAvailable,
    collateralizationRatio,
    liquidationRatio,
  } = state

  const messages: OpenVaultMessage[] = []

  // error
  if (depositAmount?.gt(maxDepositAmount)) {
    messages.push({ kind: 'depositAmountGreaterThanMaxDepositAmount' })
  }

  // error
  if (generateAmount?.lt(debtFloor)) {
    messages.push({ kind: 'generateAmountLessThanDebtFloor' })
  }

  // error
  if (generateAmount?.gt(ilkDebtAvailable)) {
    messages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  // error
  if (generateAmount?.gt(zero) && collateralizationRatio.lt(liquidationRatio)) {
    messages.push({ kind: 'vaultUnderCollateralized' })
  }

  // warning
  if (depositAmount?.gt(zero) && depositAmountUSD.lt(debtFloor)) {
    messages.push({ kind: 'potentialGenerateAmountLessThanDebtFloor' })
  }

  return { ...state, messages }
}

type OpenVaultChange = Changes<OpenVaultState>

export type ManualChange =
  | Change<OpenVaultState, 'depositAmount'>
  | Change<OpenVaultState, 'generateAmount'>

const apply: ApplyChange<OpenVaultState> = applyChange

type OpenVaultMessage = {
  kind:
    | 'depositAmountGreaterThanMaxDepositAmount'
    | 'generateAmountLessThanDebtFloor'
    | 'generateAmountGreaterThanDebtCeiling'
    | 'potentialGenerateAmountLessThanDebtFloor'
    | 'vaultUnderCollateralized'
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
  messages: OpenVaultMessage[]
  account: string
  token: string

  // Dynamic Data
  proxyAddress?: string
  allowance?: boolean
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
  txError?: any
}

function setAllowance(
  { sendWithGasEstimation }: TxHelpers,
  allowance$: Observable<boolean>,
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
            filter((allowance) => allowance),
            switchMap(() => of({ kind: 'stage', stage: 'allowanceSuccess' })),
          ),
      ),
    )
    .subscribe((ch) => change(ch))
}

function createProxy(
  { safeConfirmations }: ContextConnected,
  { sendWithGasEstimation }: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
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
              (txState as any).confirmations < safeConfirmations
                ? of({
                    kind: 'proxyConfirmations',
                    proxyConfirmations: (txState as any).confirmations,
                  })
                : of(
                    { kind: 'proxyAddress', proxyAddress: proxyAddress! },
                    {
                      kind: 'stage',
                      stage: state.token === 'ETH' ? 'editing' : 'allowanceWaitingForConfirmation',
                    },
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
              stage: 'openFiasco',
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
  context: ContextConnected,
  txHelpers: TxHelpers,
  proxyAddress$: Observable<string | undefined>,
  allowance$: Observable<boolean>,
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

  if (state.stage === 'editing') {
    return {
      ...state,
      change,
      reset,
      progress: !state.messages.length
        ? () => {
            if (!state.proxyAddress) {
              change({ kind: 'stage', stage: 'proxyWaitingForConfirmation' })
            } else if (!state.allowance) {
              change({ kind: 'stage', stage: 'allowanceWaitingForConfirmation' })
            } else {
              change({ kind: 'stage', stage: 'openWaitingForConfirmation' })
            }
          }
        : undefined,
    }
  }

  if (state.stage === 'proxyWaitingForConfirmation' || state.stage === 'proxyFailure') {
    return {
      ...state,
      progress: () => createProxy(context, txHelpers, proxyAddress$, change, state),
    }
  }

  if (state.stage === 'allowanceWaitingForConfirmation' || state.stage === 'allowanceFailure') {
    return {
      ...state,
      progress: () => setAllowance(txHelpers, allowance$, change, state),
    }
  }

  if (state.stage === 'openWaitingForConfirmation' || state.stage === 'openFailure') {
    return {
      ...state,
      progress: () => openVault(txHelpers, change, state),
      reset,
    }
  }

  return state
}

export function createOpenVault$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
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

              const connectedProxyAddress$ = proxyAddress$(account)

              const connectedAllowance$ = connectedProxyAddress$.pipe(
                switchMap((proxyAddress) =>
                  proxyAddress ? allowance$(token, account, proxyAddress) : of(false),
                ),
              )
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

              return combineLatest(
                userTokenInfo$,
                ilkData$(ilk),
                connectedProxyAddress$,
                connectedAllowance$,
              ).pipe(
                switchMap(
                  ([
                    { collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance },
                    { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                    proxyAddress,
                    allowance,
                  ]) => {
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
                      messages: [],
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

                    return merge(change$, environmentChanges$).pipe(
                      scan(apply, initialState),
                      map(applyVaultCalculations),
                      map(validate),
                      map(
                        curry(addTransitions)(
                          context,
                          txHelpers,
                          connectedProxyAddress$,
                          connectedAllowance$,
                          change,
                        ),
                      ),
                      shareReplay(1),
                    )
                  },
                ),
              )
            }),
          ),
        )
      }),
      map(applyIsStageStates),
    )
}
