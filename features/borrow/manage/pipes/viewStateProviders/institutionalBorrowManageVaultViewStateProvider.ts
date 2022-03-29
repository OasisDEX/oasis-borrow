import BigNumber from 'bignumber.js'
import { InstiVault } from 'blockchain/instiVault'

import {
  ManageInstiVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'
import { applyManageVaultInput } from '../viewStateTransforms/manageVaultInput'
import { applyManageVaultForm } from '../viewStateTransforms/manageVaultForm'
import { applyManageVaultAllowance } from '../viewStateTransforms/manageVaultAllowances'
import { applyManageVaultTransition } from '../viewStateTransforms/manageVaultTransitions'
import { applyManageVaultTransaction } from '../viewStateTransforms/manageVaultTransactions'
import { applyManageVaultEnvironment } from '../viewStateTransforms/manageVaultEnvironment'
import { applyManageVaultInjectedOverride } from '../viewStateTransforms/manageVaultInjectedOverride'
import { applyManageVaultCalculations } from '../viewStateTransforms/manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from '../viewStateTransforms/manageVaultConditions'
import { applyManageVaultSummary } from '../viewStateTransforms/manageVaultSummary'
import { VaultErrorMessage } from '../../../../form/errorMessagesHandler'

function applyMinActiveColRatioCondition(viewState: ManageInstiVaultState): ManageInstiVaultState {
  const {
    inputAmountsEmpty,
    afterCollateralizationRatio,
    vault: { activeCollRatio },
  } = viewState

  const vaultWillBeTakenUnderMinActiveColRatio =
    !inputAmountsEmpty &&
    afterCollateralizationRatio.lt(activeCollRatio) &&
    !afterCollateralizationRatio.isZero()
  return { ...viewState, vaultWillBeTakenUnderMinActiveColRatio }
}

export const InstitutionalBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  InstiVault,
  ManageInstiVaultState
> = {
  addErrorsAndWarnings(viewState: ManageInstiVaultState): ManageInstiVaultState {
    return {
      ...viewState,
      errorMessages: [
        ...viewState.errorMessages,
        ...(viewState.vaultWillBeTakenUnderMinActiveColRatio
          ? ['vaultWillBeTakenUnderMinActiveColRatio' as const]
          : []),
      ],
      canProgress: viewState.canProgress && !viewState.vaultWillBeTakenUnderMinActiveColRatio,
    }
  },

  transformVaultState(
    viewState: ManageInstiVaultState,
    change: ManageVaultChange,
  ): ManageInstiVaultState {
    const s1 = applyManageVaultInput(change, viewState)
    const s2 = applyManageVaultForm(change, s1)
    const s3 = applyManageVaultAllowance(change, s2)
    const s4 = applyManageVaultTransition(change, s3)
    const s5 = applyManageVaultTransaction(change, s4)
    const s6 = applyManageVaultEnvironment(change, s5)
    const s7 = applyManageVaultInjectedOverride(change, s6)
    const s8 = applyManageVaultCalculations(s7)
    const s9 = applyManageVaultStageCategorisation(s8)
    const s10 = applyManageVaultConditions(s9)
    const s11 = applyMinActiveColRatioCondition(s10)
    return applyManageVaultSummary(s11)
  },

  addTxnCost(viewState: ManageInstiVaultState): ManageInstiVaultState {
    // for origination fee, assume if generate amount not set we are generating 0 DAI
    const generateAmount = viewState.generateAmount || new BigNumber(0)

    const originationFeeUSD = generateAmount.times(
      viewState.vault.originationFeePercent.dividedBy(100),
    )

    const transactionFeeUsd = originationFeeUSD?.plus(viewState.gasEstimationUsd!)

    const transactionFeeETH = transactionFeeUsd?.div(viewState.priceInfo.currentEthPrice!)

    return {
      ...viewState,
      originationFeeUSD,
      transactionFeeETH,
    }
  },

  createInitialVaultState(args: CreateInitialVaultStateArgs<InstiVault>): ManageInstiVaultState {
    const mananageStandardVaultViewState: ManageStandardBorrowVaultState = {
      ...StandardBorrowManageVaultViewStateProvider.createInitialVaultState(args),
      vault: args.vault,
    }
    return {
      ...mananageStandardVaultViewState,
      vault: args.vault,
      originationFeeUSD: undefined,
    }
  },
}
