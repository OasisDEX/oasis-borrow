import type { BigNumber } from 'bignumber.js'
import type { ProxyActionsSmartContractAdapterInterface } from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import type { VaultActionsLogicInterface } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { getNetworkContracts } from 'blockchain/contracts'
import { createIlkDataChange$ } from 'blockchain/ilks'
import type { IlkData } from 'blockchain/ilks.types'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { applyAllowanceChanges } from 'features/allowance/allowance'
import { setAllowance } from 'features/allowance/setAllowance'
import { openFlowInitialStopLossLevel } from 'features/automation/common/openFlowInitialStopLossLevel'
import { applyOpenVaultStopLoss } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import {
  addStopLossTrigger,
  applyStopLossOpenFlowTransaction,
} from 'features/automation/protection/stopLoss/openFlow/stopLossOpenFlowTransaction'
import { createProxy } from 'features/proxy/createProxy'
import { applyProxyChanges } from 'features/proxy/proxy'
import { balanceInfoChange$ } from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { priceInfoChange$ } from 'features/shared/priceInfo'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import { createApplyOpenVaultTransition } from 'features/vaultTransitions/openVaultTransitions'
import { getLocalAppConfig } from 'helpers/config'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { combineApplyChanges } from 'helpers/pipelines/combineApply'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { curry } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, merge, of, Subject, throwError } from 'rxjs'
import { first, map, scan, shareReplay, switchMap } from 'rxjs/operators'

import { defaultMutableOpenVaultState } from './openVault.constants'
import type { MutableOpenVaultState, OpenVaultChange, OpenVaultState } from './openVault.types'
import { applyOpenVaultCalculations } from './openVaultCalculations'
import type { OpenVaultCalculations } from './openVaultCalculations.types'
import { defaultOpenVaultStateCalculations } from './openVaultCalculations.types'
import {
  applyOpenVaultConditions,
  applyOpenVaultStageCategorisation,
  calculateInitialTotalSteps,
} from './openVaultConditions'
import { defaultOpenVaultConditions } from './openVaultConditions.constants'
import type { OpenVaultConditions } from './openVaultConditions.types'
import { applyOpenVaultEnvironment } from './openVaultEnvironment'
import { applyOpenVaultForm } from './openVaultForm'
import { applyOpenVaultInput } from './openVaultInput'
import { applyOpenVaultSummary } from './openVaultSummary'
import { defaultOpenVaultSummary } from './openVaultSummary.constants'
import { applyEstimateGas, applyOpenVaultTransaction, openVault } from './openVaultTransactions'
import { finalValidation, validateErrors, validateWarnings } from './openVaultValidations'

function applyOpenVaultInjectedOverride(state: OpenVaultState, change: OpenVaultChange) {
  if (change.kind === 'injectStateOverride') {
    return {
      ...state,
      ...change.stateToOverride,
    }
  }
  return state
}

function addTransitions(
  txHelpers: TxHelpers,
  vaultActions: VaultActionsLogicInterface,
  proxyAddress$: Observable<string | undefined>,
  change: (ch: OpenVaultChange) => void,
  state: OpenVaultState,
): OpenVaultState {
  if (state.stage === 'editing') {
    return {
      ...state,
      updateDeposit: (depositAmount?: BigNumber) => {
        change({ kind: 'deposit', depositAmount })
      },
      updateDepositUSD: (depositAmountUSD?: BigNumber) =>
        change({ kind: 'depositUSD', depositAmountUSD }),
      updateDepositMax: () => change({ kind: 'depositMax' }),
      updateGenerate: (generateAmount?: BigNumber) => {
        change({ kind: 'generate', generateAmount })
      },
      updateGenerateMax: () => change({ kind: 'generateMax' }),
      toggleGenerateOption: () => change({ kind: 'toggleGenerateOption' }),
      progress: () => change({ kind: 'progressEditing' }),
    }
  }

  if (state.stage === 'stopLossEditing') {
    return {
      ...state,
      progress: () => change({ kind: 'progressStopLossEditing' }),
      regress: () => change({ kind: 'backToEditing' }),
      skipStopLoss: () => change({ kind: 'skipStopLoss' }),
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

  if (state.stage === 'txWaitingForConfirmation' || state.stage === 'txFailure') {
    return {
      ...state,
      progress: () => openVault(txHelpers, vaultActions, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  if (state.stage === 'txSuccess') {
    return {
      ...state,
      progress: () =>
        change({
          kind: 'backToEditing',
        }),
    }
  }

  if (state.stage === 'stopLossTxWaitingForConfirmation' || state.stage === 'stopLossTxFailure') {
    return {
      ...state,
      progress: () => addStopLossTrigger(txHelpers, change, state),
      regress: () => change({ kind: 'backToEditing' }),
    }
  }

  return state
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
  ilkToToken$: (ilk: string) => Observable<string>,
  addGasEstimation$: AddGasEstimationFunction,
  proxyActionsAdapterResolver$: ({
    ilk,
  }: {
    ilk: string
  }) => Observable<ProxyActionsSmartContractAdapterInterface>,
  ilk: string,
): Observable<OpenVaultState> {
  return ilks$.pipe(
    switchMap((ilks) =>
      iif(
        () => !ilks.some((i) => i === ilk),
        throwError(new Error(`Ilk ${ilk} does not exist`)),
        combineLatest(
          context$,
          txHelpers$,
          ilkToToken$(ilk),
          proxyActionsAdapterResolver$({ ilk }),
        ).pipe(
          switchMap(([context, txHelpers, token, proxyActionsAdapter]) => {
            const account = context.account
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
                    const vaultActions = vaultActionsLogic(proxyActionsAdapter)
                    const change$ = new Subject<OpenVaultChange>()

                    function change(ch: OpenVaultChange) {
                      change$.next(ch)
                    }

                    // NOTE: Not to be used in production/dev, test only
                    function injectStateOverride(stateToOverride: Partial<MutableOpenVaultState>) {
                      return change$.next({ kind: 'injectStateOverride', stateToOverride })
                    }

                    const { StopLossWrite: stopLossWriteEnabled } = getLocalAppConfig('features')
                    const withStopLossStage = stopLossWriteEnabled
                      ? isSupportedAutomationIlk(context.chainId, ilk)
                      : false

                    const totalSteps = calculateInitialTotalSteps(proxyAddress, token, allowance)
                    const initialStopLossSelected = openFlowInitialStopLossLevel({
                      liquidationRatio: ilkData.liquidationRatio,
                    })

                    const initialState: OpenVaultState = {
                      ...defaultMutableOpenVaultState,
                      ...defaultOpenVaultStateCalculations,
                      ...defaultOpenVaultConditions,
                      withStopLossStage,
                      setStopLossCloseType: (type: 'collateral' | 'dai') =>
                        change({ kind: 'stopLossCloseType', type }),
                      setStopLossLevel: (level: BigNumber) =>
                        change({ kind: 'stopLossLevel', level }),
                      stopLossCloseType: 'dai',
                      stopLossLevel: initialStopLossSelected,
                      visitedStopLossStep: false,
                      priceInfo,
                      balanceInfo,
                      ilkData,
                      token,
                      account,
                      ilk,
                      proxyAddress,
                      allowance,
                      safeConfirmations: getNetworkContracts(NetworkIds.MAINNET, context.chainId)
                        .safeConfirmations,
                      openVaultSafeConfirmations: getNetworkContracts(
                        NetworkIds.MAINNET,
                        context.chainId,
                      ).openVaultSafeConfirmations,
                      etherscan: getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan
                        .url,
                      errorMessages: [],
                      warningMessages: [],
                      summary: defaultOpenVaultSummary,
                      totalSteps,
                      currentStep: 1,
                      clear: () => change({ kind: 'clear' }),
                      gasEstimationStatus: GasEstimationStatus.unset,
                      injectStateOverride,
                    }

                    const apply = combineApplyChanges<OpenVaultState, OpenVaultChange>(
                      applyOpenVaultInput,
                      applyOpenVaultForm,
                      applyOpenVaultStopLoss,
                      createApplyOpenVaultTransition<
                        OpenVaultState,
                        MutableOpenVaultState,
                        OpenVaultCalculations,
                        OpenVaultConditions
                      >(
                        defaultMutableOpenVaultState,
                        defaultOpenVaultStateCalculations,
                        defaultOpenVaultConditions,
                      ),
                      applyProxyChanges,
                      applyOpenVaultTransaction,
                      applyStopLossOpenFlowTransaction,
                      applyAllowanceChanges,
                      applyOpenVaultEnvironment,
                      applyOpenVaultInjectedOverride,
                      applyOpenVaultCalculations,
                      applyOpenVaultStageCategorisation,
                      applyOpenVaultConditions,
                      applyOpenVaultSummary,
                    )

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
                      switchMap(curry(applyEstimateGas)(addGasEstimation$, vaultActions)),
                      map(finalValidation),
                      map(
                        curry(addTransitions)(
                          txHelpers,
                          vaultActions,
                          connectedProxyAddress$,
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
      ),
    ),
    shareReplay(1),
  )
}
