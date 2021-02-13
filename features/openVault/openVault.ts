import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Context, ContextConnected } from 'blockchain/network'
import { TxHelpers } from 'components/AppContext'
import { applyChange, ApplyChange, Change, Changes } from 'helpers/form'
import { zero } from 'helpers/zero'
import { curry } from 'lodash'
import { Observable, of, iif, combineLatest, merge, Subject, EMPTY } from 'rxjs'
import { startWith, switchMap, map, scan, shareReplay } from 'rxjs/operators'

function contextInfo$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  ilk: string,
): Observable<ContextInfo> {
  const token = ilk.split('-')[0]
  return context$.pipe(
    switchMap((context) => {
      return iif(
        () => context.status === 'connectedReadonly',
        of({
          collateralBalance: zero,
          collateralPrice: zero,
          ethBalance: zero,
          ethPrice: zero,
          daiBalance: zero,
          token,
          context,
        }),
        combineLatest(
          txHelpers$,
          balance$(token, (context as ContextConnected).account),
          tokenOraclePrice$(token),
          balance$('ETH', (context as ContextConnected).account),
          tokenOraclePrice$('ETH'),
          balance$('DAI', (context as ContextConnected).account),
        ).pipe(
          switchMap(
            ([txHelpers, collateralBalance, collateralPrice, ethBalance, ethPrice, daiBalance]) =>
              of({
                txHelpers,
                collateralBalance,
                collateralPrice,
                ethBalance,
                ethPrice,
                daiBalance,
                token,
                context,
              }),
          ),
        ),
      )
    }),
  )
}
const defaultIsStates = {
  isIlkValidationStage: false,
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
  isConnected: false,
  isReadonly: false,
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
    case 'editingReadonly':
      return {
        ...newState,
        isEditingStage: true,
        isReadonly: true,
      }
    case 'editingConnected':
      return {
        ...newState,
        isEditingStage: true,
        isConnected: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxyWaitToContinue':
      return {
        ...newState,
        isProxyStage: true,
        isConnected: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceWaitToContinue':
      return {
        ...newState,
        isAllowanceStage: true,
        isConnected: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openWaitToContinue':
      return {
        ...newState,
        isOpenStage: true,
        isConnected: true,
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

  const maxGenerateAmount = depositAmount.times(maxDebtPerUnitCollateral)

  const depositAmountUSD = collateralPrice.times(depositAmount)
  const generateAmountUSD = generateAmount // 1 DAI === 1 USD

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

  if (depositAmount.eq(zero)) {
    messages.push({ kind: 'depositAmountEmpty' })
  }

  if (depositAmount.gt(maxDepositAmount)) {
    messages.push({ kind: 'depositAmountGreaterThanMaxDepositAmount' })
  }

  if (generateAmount.lt(debtFloor)) {
    messages.push({ kind: 'generateAmountLessThanDebtFloor' })
  }

  if (depositAmountUSD.lt(debtFloor)) {
    messages.push({ kind: 'potentialGenerateAmountLessThanDebtFloor' })
  }

  if (generateAmount.gt(ilkDebtAvailable)) {
    messages.push({ kind: 'generateAmountGreaterThanDebtCeiling' })
  }

  if (generateAmount.gt(zero) && collateralizationRatio.lt(liquidationRatio)) {
    messages.push({ kind: 'vaultUnderCollateralized' })
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
    | 'depositAmountEmpty'
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
  | 'editingReadonly'
  | 'editingConnected'
  | 'proxyWaitingForConfirmation'
  | 'proxyWaitingForApproval'
  | 'proxyInProgress'
  | 'proxyFailure'
  | 'proxyWaitToContinue'
  | 'allowanceWaitingForConfirmation'
  | 'allowanceWaitingForApproval'
  | 'allowanceInProgress'
  | 'allowanceFailure'
  | 'allowanceWaitToContinue'
  | 'openWaitingForConfirmation'
  | 'openWaitingForApproval'
  | 'openInProgress'
  | 'openFailure'
  | 'openWaitToContinue'

interface isStageStates {
  isIlkValidationStage: boolean
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
  isConnected: boolean
  isReadonly: boolean
}

interface ContextInfo {
  context: Context
  txHelpers?: TxHelpers
  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber
  token: string
}

interface DiscriminatedIlkInfo {
  maxDebtPerUnitCollateral: BigNumber
  ilkDebtAvailable: BigNumber
  debtFloor: BigNumber
  liquidationRatio: BigNumber
}

interface FormCalculations {
  maxDepositAmount: BigNumber
  maxGenerateAmount: BigNumber
  depositAmountUSD: BigNumber
  generateAmountUSD: BigNumber
  maxDepositAmountUSD: BigNumber
}

interface VaultCalculations {
  liquidationPrice: BigNumber
  afterLiquidationPrice: BigNumber

  collateralizationRatio: BigNumber
  afterCollateralizationRatio: BigNumber

  lockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber
}

export interface BasicOpenVaultState {
  stage: OpenVaultStage
  ilk: string
  messages: OpenVaultMessage[]
  depositAmount: BigNumber
  generateAmount: BigNumber
  account?: string
  progress?: () => void
  proxyAddress?: string
  allowance?: boolean

  change?: (change: ManualChange) => void

  collateralBalance: BigNumber
  collateralPrice: BigNumber
  ethBalance: BigNumber
  ethPrice: BigNumber
  daiBalance: BigNumber
  token: string
}

export type OpenVaultState = BasicOpenVaultState &
  DiscriminatedIlkInfo &
  VaultCalculations &
  FormCalculations &
  isStageStates

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

  // function close() {
  //   change({ kind: 'stage', stage: 'editing' })
  //   change({ kind: 'lockAmount', lockAmount: undefined })
  //   change({ kind: 'drawAmount', drawAmount: undefined })
  //   change({ kind: 'maxLockAmount', maxLockAmount: undefined })
  //   change({ kind: 'maxDrawAmount', maxDrawAmount: undefined })
  // }

  if (state.stage === 'editingConnected' || state.stage === 'editingReadonly') {
    return {
      ...state,
      change,
      progress:
        !state.messages.length && state.stage === 'editingConnected'
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

  // if (state.stage === 'proxyWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     createProxy: () => createProxy(context, txHelpers, proxyAddress$, change, state),
  //   }
  // }

  // if (state.stage === 'proxyFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => createProxy(context, txHelpers, proxyAddress$, change, state),
  //   }
  // }

  // if (state.stage === 'allowanceWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     setAllowance: () => setAllowance(txHelpers, allowance$, change, state),
  //   }
  // }

  // if (state.stage === 'allowanceFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => setAllowance(txHelpers, allowance$, change, state),
  //   }
  // }

  // if (state.stage === 'waitToContinue') {
  //   return {
  //     ...state,
  //     proceed: () => change({ kind: 'stage', stage: 'transactionWaitingForConfirmation' }),
  //   }
  // }

  // if (state.stage === 'transactionWaitingForConfirmation') {
  //   return {
  //     ...state,
  //     openVault: () => openVault(txHelpers, change, state),
  //     back: backToOpenVaultModalEditing,
  //   }
  // }

  // if (state.stage === 'transactionFiasco') {
  //   return {
  //     ...state,
  //     tryAgain: () => openVault(txHelpers, change, state),
  //     back: backToOpenVaultModalEditing,
  //   }
  // }

  // if (state.stage === 'transactionSuccess') {
  //   return {
  //     ...state,
  //     close,
  //   }
  // }

  return state
}

export function createOpenVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<boolean>,
  tokenOraclePrice$: (token: string) => Observable<BigNumber>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilks$: Observable<string[]>,
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
          contextInfo$(context$, txHelpers$, balance$, tokenOraclePrice$, ilk).pipe(
            switchMap(
              ({
                collateralBalance,
                collateralPrice,
                ethBalance,
                ethPrice,
                daiBalance,
                txHelpers,
                context,
                token,
              }) => {
                const isConnected = context.status === 'connected'

                const account = isConnected ? (context as ContextConnected).account : undefined
                const initialStage = isConnected ? 'editingConnected' : 'editingReadonly'

                const connectedProxyAddress$ = isConnected ? proxyAddress$(account!) : of(undefined)

                const connectedAllowance$ = connectedProxyAddress$.pipe(
                  switchMap((proxyAddress) =>
                    proxyAddress ? allowance$(token, account!, proxyAddress) : of(false),
                  ),
                )

                const change$ = new Subject<OpenVaultChange>()

                function change(ch: OpenVaultChange) {
                  change$.next(ch)
                }

                const collateralBalanceChange$ = isConnected
                  ? balance$(token, account!).pipe(
                      map((collateralBalance) => ({
                        kind: 'collateralBalance',
                        collateralBalance,
                      })),
                    )
                  : EMPTY

                const ethBalanceChange$ = isConnected
                  ? balance$('ETH', account!).pipe(
                      map((ethBalance) => ({ kind: 'ethBalance', ethBalance })),
                    )
                  : EMPTY

                const daiBalanceChange$ = isConnected
                  ? balance$('DAI', account!).pipe(
                      map((daiBalance) => ({ kind: 'daiBalance', daiBalance })),
                    )
                  : EMPTY

                return combineLatest(
                  ilkData$(ilk),
                  connectedProxyAddress$,
                  connectedAllowance$,
                ).pipe(
                  switchMap(
                    ([
                      { maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor, liquidationRatio },
                      proxyAddress,
                      allowance,
                    ]) => {
                      const initialState: OpenVaultState = {
                        ...defaultIsStates,
                        stage: initialStage,
                        token,
                        account,
                        collateralBalance,
                        collateralPrice,
                        ethBalance,
                        ethPrice,
                        daiBalance,
                        messages: [],
                        depositAmount: zero,
                        generateAmount: zero,
                        maxDepositAmount: zero,
                        maxGenerateAmount: zero,
                        collateralizationRatio: zero,
                        depositAmountUSD: zero,
                        generateAmountUSD: zero,
                        maxDepositAmountUSD: zero,
                        ilk,
                        maxDebtPerUnitCollateral,
                        ilkDebtAvailable,
                        debtFloor,
                        liquidationRatio,
                        proxyAddress,
                        allowance,
                      }

                      const ilkDataChange$ = ilkData$(ilk).pipe(
                        map(({ maxDebtPerUnitCollateral, ilkDebtAvailable, debtFloor }) => [
                          {
                            kind: 'maxDebtPerUnitCollateral',
                            maxDebtPerUnitCollateral,
                          },
                          {
                            kind: 'ilkDebtAvailable',
                            ilkDebtAvailable,
                          },
                          {
                            kind: 'debtFloor',
                            debtFloor,
                          },
                        ]),
                      )

                      const collateralPriceChange$ = tokenOraclePrice$(ilk).pipe(
                        map((collateralPrice) => ({ kind: 'collateralPrice', collateralPrice })),
                      )

                      const environmentChanges$ = merge(
                        collateralPriceChange$,
                        ilkDataChange$,
                        collateralBalanceChange$,
                        ethBalanceChange$,
                        daiBalanceChange$,
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
              },
            ),
          ),
        )
      }),
      map(applyIsStageStates),
    )
}
