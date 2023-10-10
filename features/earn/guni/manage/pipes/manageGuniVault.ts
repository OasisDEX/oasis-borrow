import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { getNetworkContracts } from 'blockchain/contracts'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { createVaultChange$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { calculateInitialTotalSteps } from 'features/borrow/open/pipes/openVaultConditions'
import type { MakerOracleTokenPrice } from 'features/earn/makerOracleTokenPrices'
import type { ExchangeAction, ExchangeType, Quote } from 'features/exchange/exchange'
import { applyExchange } from 'features/multiply/manage/pipes/manageMultiplyQuote'
import { applyManageVaultCalculations } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { defaultManageMultiplyVaultCalculations } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations.constants'
import type { ManageMultiplyVaultChange } from 'features/multiply/manage/pipes/ManageMultiplyVaultChange.types'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from 'features/multiply/manage/pipes/manageMultiplyVaultConditions'
import { defaultManageMultiplyVaultConditions } from 'features/multiply/manage/pipes/manageMultiplyVaultConditions.constants'
import { applyManageVaultEnvironment } from 'features/multiply/manage/pipes/manageMultiplyVaultEnvironment'
import { manageMultiplyInputsDefaults } from 'features/multiply/manage/pipes/manageMultiplyVaultForm.constants'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { applyManageVaultSummary } from 'features/multiply/manage/pipes/manageMultiplyVaultSummary'
import { defaultManageVaultSummary } from 'features/multiply/manage/pipes/manageMultiplyVaultSummary.constants'
import { applyManageVaultTransaction } from 'features/multiply/manage/pipes/manageMultiplyVaultTransactions'
import { applyManageVaultTransition } from 'features/multiply/manage/pipes/manageMultiplyVaultTransitions'
import {
  finalValidation,
  validateErrors,
  validateWarnings,
} from 'features/multiply/manage/pipes/manageMultiplyVaultValidations'
import type { MutableManageMultiplyVaultState } from 'features/multiply/manage/pipes/MutableManageMultiplyVaultState.types'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { createHistoryChange$ } from 'features/vaultHistory/vaultHistory'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { GUNI_SLIPPAGE } from 'helpers/multiply/calculations.constants'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { one } from 'helpers/zero'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators'

import { closeGuniVault } from './guniActionsCalls'
import type { GuniTxData, GuniTxDataChange, ManageEarnVaultState } from './manageGuniVault.types'
import { applyGuniCalculations } from './manageGuniVaultCalculations'
import { applyGuniManageVaultConditions } from './manageGuniVaultConditions'
import { applyGuniManageEstimateGas } from './manageGuniVaultTransactions'

export type ManageEarnVaultState = ManageMultiplyVaultState & {
  totalValueLocked?: BigNumber
  earningsToDate?: BigNumber
  earningsToDateAfterFees?: BigNumber
  netAPY?: BigNumber
  makerOracleTokenPrices: {
    today: MakerOracleTokenPrice
    sevenDaysAgo: MakerOracleTokenPrice
  }
}

function applyManageVaultInjectedOverride(
  change: ManageMultiplyVaultChange,
  state: ManageEarnVaultState,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

function applyGuniDataChanges<S, Ch extends GuniTxDataChange>(change: Ch, state: S): S {
  if (change.kind === 'guniTxData') {
    const { kind: _, ...data } = change

    return {
      ...state,
      ...data,
    }
  }
  return state
}

export function applyManageGuniVaultTransition(
  change: ManageMultiplyVaultChange,
  state: ManageEarnVaultState,
): ManageEarnVaultState {
  if (change.kind === 'clear') {
    return {
      ...state,
      ...defaultMutableManageMultiplyVaultState,
      ...defaultManageMultiplyVaultCalculations,
      ...defaultManageMultiplyVaultConditions,
      ...manageMultiplyInputsDefaults,
    }
  }

  return state
}

function apply(
  state: ManageEarnVaultState,
  change: ManageMultiplyVaultChange | GuniTxDataChange,
): ManageEarnVaultState {
  const s1 = applyExchange(change as ManageMultiplyVaultChange, state)
  const s2 = applyManageVaultTransition(
    change as ManageMultiplyVaultChange,
    s1,
  ) as ManageEarnVaultState
  const s3 = applyManageGuniVaultTransition(change as ManageMultiplyVaultChange, s2)
  const s4 = applyManageVaultTransaction(change as ManageMultiplyVaultChange, s3)
  const s5 = applyManageVaultEnvironment(change as ManageMultiplyVaultChange, s4)
  const s6 = applyManageVaultInjectedOverride(change as ManageMultiplyVaultChange, s5)
  const s7 = applyGuniDataChanges(change as GuniTxDataChange, s6)
  const s8 = applyManageVaultCalculations(s7)
  const s9 = applyGuniCalculations(s8)
  const s10 = applyManageVaultStageCategorisation(s9)
  const s11 = applyManageVaultConditions(s10)
  const s12 = applyGuniManageVaultConditions(s11)
  return applyManageVaultSummary(s12)
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
      progress: () => change({ kind: 'progressEditing' }),
      setCloseVaultTo: () =>
        change({
          kind: 'toggleEditing',
          stage: state.stage === 'adjustPosition' ? 'otherActions' : 'adjustPosition',
        }),
    }
  }

  if (state.stage === 'manageWaitingForConfirmation' || state.stage === 'manageFailure') {
    return {
      ...state,
      progress: () => closeGuniVault(txHelpers$, change, state),
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

export const defaultMutableManageMultiplyVaultState = {
  stage: 'adjustPosition',
  originalEditingStage: 'adjustPosition',
  collateralAllowanceAmount: maxUint256,
  daiAllowanceAmount: maxUint256,
  selectedCollateralAllowanceRadio: 'unlimited',
  selectedDaiAllowanceRadio: 'unlimited',
  showSliderController: true,
  closeVaultTo: 'dai',
  mainAction: 'buy',
  otherAction: 'closeVault',
} as MutableManageMultiplyVaultState

export function createManageGuniVault$(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  allowance$: (token: string, owner: string, spender: string) => Observable<BigNumber>,
  priceInfo$: (token: string) => Observable<PriceInfo>,
  balanceInfo$: (token: string, address: string | undefined) => Observable<BalanceInfo>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  vault$: (id: BigNumber, chainId: number) => Observable<Vault>,
  exchangeQuote$: (
    token: string,
    slippage: BigNumber,
    amount: BigNumber,
    action: ExchangeAction,
    exchangeType: ExchangeType,
  ) => Observable<Quote>,
  addGasEstimation$: AddGasEstimationFunction,
  getProportions$: (
    gUniAmount: BigNumber,
    token: string,
  ) => Observable<{ sharedAmount0: BigNumber; sharedAmount1: BigNumber }>,
  vaultHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  historicalTokenPrices$: (token: string, timestamp: Dayjs) => Observable<MakerOracleTokenPrice>,
  id: BigNumber,
): Observable<ManageEarnVaultState> {
  return context$.pipe(
    switchMap((context) => {
      const account = context.status === 'connected' ? context.account : undefined
      return vault$(id, context.chainId).pipe(
        first(),
        switchMap((vault) => {
          return combineLatest(
            priceInfo$(vault.token),
            balanceInfo$(vault.token, account),
            ilkData$(vault.ilk),
            account ? proxyAddress$(account) : of(undefined),
            historicalTokenPrices$(vault.token, dayjs()),
            historicalTokenPrices$(vault.token, dayjs().subtract(7, 'd')),
          ).pipe(
            first(),
            switchMap(
              ([
                priceInfo,
                balanceInfo,
                ilkData,
                proxyAddress,
                tokenPriceToday,
                tokenPriceSevenDaysAgo,
              ]) => {
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

                    const initialState: ManageEarnVaultState & GuniTxData = {
                      ...defaultMutableManageMultiplyVaultState,
                      ...defaultManageMultiplyVaultCalculations,
                      ...defaultManageMultiplyVaultConditions,
                      vaultType: VaultType.Earn,
                      vault,
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      account,
                      proxyAddress,
                      collateralAllowance,
                      daiAllowance,
                      safeConfirmations: getNetworkContracts(NetworkIds.MAINNET, context.chainId)
                        .safeConfirmations,
                      etherscan: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan
                        .url,
                      errorMessages: [],
                      warningMessages: [],
                      summary: defaultManageVaultSummary,
                      slippage: GUNI_SLIPPAGE,
                      exchangeError: false,
                      initialTotalSteps,
                      totalSteps: initialTotalSteps,
                      currentStep: 1,
                      vaultHistory: [],
                      toggle: (stage) => change({ kind: 'toggleEditing', stage }),
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      invalidSlippage: false,
                      injectStateOverride,
                      makerOracleTokenPrices: {
                        today: tokenPriceToday,
                        sevenDaysAgo: tokenPriceSevenDaysAgo,
                      },
                    }

                    const stateSubject$ = new Subject<ManageMultiplyVaultState>()
                    const stateSubjectShared$ = stateSubject$.pipe(shareReplay(1))

                    const environmentChanges$ = merge(
                      priceInfoChange$(priceInfo$, vault.token),
                      balanceInfoChange$(balanceInfo$, vault.token, account),
                      createIlkDataChange$(ilkData$, vault.ilk),
                      createVaultChange$(vault$, id, context.chainId),
                      createHistoryChange$(vaultHistory$, id),
                    )

                    const guniDataChange$ = environmentChanges$.pipe(
                      withLatestFrom(stateSubjectShared$),
                      switchMap(([_, state]) => {
                        return getProportions$(vault.lockedCollateral, vault.token).pipe(
                          switchMap(({ sharedAmount0, sharedAmount1 }) => {
                            const requiredDebt = vault.debt
                            const { token1 } = getToken(vault.token) // USDC

                            return exchangeQuote$(
                              token1!,
                              state.slippage,
                              sharedAmount1.minus(0.01),
                              'SELL_COLLATERAL',
                              'noFeesExchange',
                            ).pipe(
                              map((swap) => {
                                if (swap.status !== 'SUCCESS') {
                                  return of({ kind: 'exchangeError' })
                                }

                                return {
                                  kind: 'guniTxData',
                                  swap,
                                  sharedAmount0,
                                  sharedAmount1: sharedAmount1.minus(0.01),
                                  requiredDebt,
                                  fromTokenAmount: swap.collateralAmount,
                                  toTokenAmount: swap.quoteAmount,
                                  minToTokenAmount: swap.quoteAmount.times(
                                    one.minus(state.slippage),
                                  ),
                                }
                              }),
                            )
                          }),
                        )
                      }),
                    )

                    const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                    return merge(change$, environmentChanges$, guniDataChange$).pipe(
                      scan(apply, initialState),
                      map(validateErrors),
                      map(validateWarnings),
                      switchMap(curry(applyGuniManageEstimateGas)(addGasEstimation$)),
                      map(finalValidation),
                      map(
                        curry(addTransitions)(txHelpers$, context, connectedProxyAddress$, change),
                      ),
                      tap((state) => stateSubject$.next(state)),
                    )
                  }),
                )
              },
            ),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
