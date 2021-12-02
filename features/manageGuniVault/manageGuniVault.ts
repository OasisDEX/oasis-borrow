import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { createIlkDataChange$, IlkData } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { createVaultChange$, Vault } from 'blockchain/vaults'
import { AddGasEstimationFunction, TxHelpers } from 'components/AppContext'
import { ExchangeAction, Quote } from 'features/exchange/exchange'
import { createMultiplyHistoryChange$ } from 'features/manageMultiplyVault/manageMultiplyHistory'
import { calculateInitialTotalSteps } from 'features/openVault/openVaultConditions'
import { PriceInfo, priceInfoChange$ } from 'features/shared/priceInfo'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { GasEstimationStatus } from 'helpers/form'
import { calculatePNL, SLIPPAGE } from 'helpers/multiply/calculations'
import { curry } from 'lodash'
import { combineLatest, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, shareReplay, switchMap, tap } from 'rxjs/operators'

import { getToken } from '../../blockchain/tokensMetadata'
import { one, zero } from '../../helpers/zero'
import { applyExchange } from '../manageMultiplyVault/manageMultiplyQuote'
import {
  CloseVaultTo,
  ManageMultiplyVaultChange,
  ManageMultiplyVaultState,
  MutableManageMultiplyVaultState,
} from '../manageMultiplyVault/manageMultiplyVault'
import {
  applyManageVaultCalculations,
  defaultManageMultiplyVaultCalculations,
} from '../manageMultiplyVault/manageMultiplyVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
  defaultManageMultiplyVaultConditions,
} from '../manageMultiplyVault/manageMultiplyVaultConditions'
import { applyManageVaultEnvironment } from '../manageMultiplyVault/manageMultiplyVaultEnvironment'
import {
  applyManageVaultSummary,
  defaultManageVaultSummary,
} from '../manageMultiplyVault/manageMultiplyVaultSummary'
import { applyManageVaultTransaction } from '../manageMultiplyVault/manageMultiplyVaultTransactions'
import { applyManageVaultTransition } from '../manageMultiplyVault/manageMultiplyVaultTransitions'
import {
  validateErrors,
  validateWarnings,
} from '../manageMultiplyVault/manageMultiplyVaultValidations'
import { BalanceInfo, balanceInfoChange$ } from '../shared/balanceInfo'
import { closeGuniVault } from './guniActionsCalls'
import { applyGuniManageEstimateGas } from './manageGuniVaultTransactions'

function applyManageVaultInjectedOverride(
  change: ManageMultiplyVaultChange,
  state: ManageMultiplyVaultState,
) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

export type GuniTxData = {
  sharedAmount0?: BigNumber
  sharedAmount1?: BigNumber
  minToTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  fromTokenAmount?: BigNumber
  requiredDebt?: BigNumber
}

type GuniTxDataChange = { kind: 'guniTxData' }

function applyGuniDataChanges<S, Ch extends GuniTxDataChange>(state: S, change: Ch): S {
  if (change.kind === 'guniTxData') {
    const { kind: _, ...data } = change

    return {
      ...state,
      ...data,
    }
  }
  return state
}
// this method overwrites state from s7
function applyGuniCalculations(state: ManageMultiplyVaultState & GuniTxData) {
  const {
    vault: { lockedCollateralUSD, debt },
    sharedAmount0,
    sharedAmount1,
    minToTokenAmount,
    vaultHistory,
  } = state

  const netValueUSD = lockedCollateralUSD.minus(debt)
  const currentPnL = calculatePNL(vaultHistory, netValueUSD)

  return {
    ...state,
    netValueUSD,
    collateralDeltaUSD: sharedAmount1,
    oazoFee: zero,
    loanFee: zero,
    fees: zero,
    currentPnL,
    afterCloseToDai:
      sharedAmount0 && minToTokenAmount ? sharedAmount0.plus(minToTokenAmount).minus(debt) : zero,
  }
}

function apply(
  state: ManageMultiplyVaultState,
  change: ManageMultiplyVaultChange | GuniTxDataChange,
) {
  const s1 = applyExchange(change as ManageMultiplyVaultChange, state)
  const s2 = applyManageVaultTransition(change as ManageMultiplyVaultChange, s1)
  const s3 = applyManageVaultTransaction(change as ManageMultiplyVaultChange, s2)
  const s4 = applyManageVaultEnvironment(change as ManageMultiplyVaultChange, s3)
  const s5 = applyManageVaultInjectedOverride(change as ManageMultiplyVaultChange, s4)
  const s6 = applyGuniDataChanges(s5, change as GuniTxDataChange)
  const s7 = applyManageVaultCalculations(s6)
  const s8 = applyGuniCalculations(s7)
  const s9 = applyManageVaultStageCategorisation(s8 as ManageMultiplyVaultState)
  const s10 = applyManageVaultConditions(s9)
  return applyManageVaultSummary(s10)
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
      setCloseVaultTo: (closeVaultTo: CloseVaultTo) =>
        change({ kind: 'closeVaultTo', closeVaultTo }),
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
  stage: 'otherActions',
  originalEditingStage: 'otherActions',
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
  ) => Observable<Quote>,
  addGasEstimation$: AddGasEstimationFunction,
  getProportions$: (
    gUniAmount: BigNumber,
    token: string,
  ) => Observable<{ sharedAmount0: BigNumber; sharedAmount1: BigNumber }>,
  vaultMultiplyHistory$: (id: BigNumber) => Observable<VaultHistoryEvent[]>,
  id: BigNumber,
): Observable<ManageMultiplyVaultState> {
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
          ).pipe(
            first(),
            switchMap(([priceInfo, balanceInfo, ilkData, proxyAddress]) => {
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

                  const initialState: ManageMultiplyVaultState & GuniTxData = {
                    ...defaultMutableManageMultiplyVaultState,
                    ...defaultManageMultiplyVaultCalculations,
                    ...defaultManageMultiplyVaultConditions,
                    vault,
                    priceInfo,
                    balanceInfo,
                    ilkData,
                    account,
                    proxyAddress,
                    collateralAllowance,
                    daiAllowance,
                    safeConfirmations: context.safeConfirmations,
                    etherscan: context.etherscan.url,
                    errorMessages: [],
                    warningMessages: [],
                    summary: defaultManageVaultSummary,
                    slippage: SLIPPAGE,
                    exchangeError: false,
                    initialTotalSteps,
                    totalSteps: initialTotalSteps,
                    currentStep: 1,
                    vaultHistory: [],
                    clear: () => change({ kind: 'clear' }),
                    gasEstimationStatus: GasEstimationStatus.unset,
                    injectStateOverride,
                  }

                  const guniDataChange$ = getProportions$(vault.lockedCollateral, vault.token).pipe(
                    switchMap(({ sharedAmount0, sharedAmount1 }) => {
                      const requiredDebt = vault.debt
                      const { token1 } = getToken(vault.token) // USDC

                      return exchangeQuote$(
                        token1!,
                        SLIPPAGE,
                        sharedAmount1.minus(0.01),
                        'SELL_COLLATERAL',
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
                            toTokenAmount: swap.daiAmount,
                            minToTokenAmount: swap.daiAmount.times(one.minus(SLIPPAGE)),
                          }
                        }),
                      )
                    }),
                  )

                  const stateSubject$ = new Subject<ManageMultiplyVaultState>()

                  const environmentChanges$ = merge(
                    priceInfoChange$(priceInfo$, vault.token),
                    balanceInfoChange$(balanceInfo$, vault.token, account),
                    createIlkDataChange$(ilkData$, vault.ilk),
                    createVaultChange$(vault$, id, context.chainId),
                    createMultiplyHistoryChange$(vaultMultiplyHistory$, id),
                    guniDataChange$,
                  )

                  const connectedProxyAddress$ = account ? proxyAddress$(account) : of(undefined)

                  return merge(change$, environmentChanges$).pipe(
                    scan(apply, initialState),
                    map(validateErrors),
                    map(validateWarnings),
                    switchMap(curry(applyGuniManageEstimateGas)(addGasEstimation$)),
                    map(curry(addTransitions)(txHelpers$, context, connectedProxyAddress$, change)),
                    tap((state) => stateSubject$.next(state)),
                  )
                }),
              )
            }),
          )
        }),
      )
    }),
    shareReplay(1),
  )
}
