import BigNumber from 'bignumber.js'
import { InstiVault } from 'blockchain/instiVault'

import {
  GenericManageBorrowVaultState,
  ManageStandardBorrowVaultState,
  ManageVaultChange,
} from '../manageVault'
import { applyManageVaultAllowance } from '../viewStateTransforms/manageVaultAllowances'
import { applyManageVaultCalculations } from '../viewStateTransforms/manageVaultCalculations'
import {
  applyManageVaultConditions,
  applyManageVaultStageCategorisation,
} from '../viewStateTransforms/manageVaultConditions'
import { applyManageVaultEnvironment } from '../viewStateTransforms/manageVaultEnvironment'
import { applyManageVaultForm } from '../viewStateTransforms/manageVaultForm'
import { applyManageVaultInjectedOverride } from '../viewStateTransforms/manageVaultInjectedOverride'
import { applyManageVaultInput } from '../viewStateTransforms/manageVaultInput'
import { applyManageVaultSummary } from '../viewStateTransforms/manageVaultSummary'
import { applyManageVaultTransaction } from '../viewStateTransforms/manageVaultTransactions'
import { applyManageVaultTransition } from '../viewStateTransforms/manageVaultTransitions'
import {
  BorrowManageVaultViewStateProviderInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageVaultViewStateProviderInterface'
import { StandardBorrowManageVaultViewStateProvider } from './standardBorrowManageVaultViewStateProvider'

export type ManageInstiVaultState = GenericManageBorrowVaultState<InstiVault> & {
  transactionFeeETH?: BigNumber
  originationFeeUSD?: BigNumber
  vaultWillBeTakenUnderMinActiveColRatio?: boolean
  vaultIsCurrentlyUnderMinActiveColRatio?: boolean
  vaultWillRemainUnderMinActiveColRatio?: boolean
}

function increasingRisk(viewState: ManageStandardBorrowVaultState): boolean {
  return (
    !viewState.inputAmountsEmpty &&
    (viewState.afterCollateralizationRatioAtNextPrice.lt(
      viewState.vault.collateralizationRatioAtNextPrice,
    ) ||
      viewState.afterCollateralizationRatio.lt(viewState.vault.collateralizationRatio))
  )
}

function applyMinActiveColRatioConditions(viewState: ManageInstiVaultState): ManageInstiVaultState {
  const {
    inputAmountsEmpty,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    vault: { activeCollRatio, collateralizationRatio, collateralizationRatioAtNextPrice },
  } = viewState

  const vaultWillBeTakenUnderMinActiveColRatioAtCurrentPrice =
    increasingRisk(viewState) &&
    afterCollateralizationRatio.lt(activeCollRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeTakenUnderMinActiveColRatioAtNextPrice =
    increasingRisk(viewState) &&
    afterCollateralizationRatioAtNextPrice.lt(activeCollRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const vaultIsCurrentlyUnderMinActiveColRatioAtCurrentPrice = collateralizationRatio.lt(
    activeCollRatio,
  )
  const vaultIsCurrentlyUnderMinActiveColRatioAtNextPrice = collateralizationRatioAtNextPrice.lt(
    activeCollRatio,
  )

  const vaultWillRemainUnderMinActiveColRatioAtCurrentPrice =
    !increasingRisk(viewState) &&
    afterCollateralizationRatio.lt(activeCollRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillRemainUnderMinActiveColRatioAtNextPrice =
    !increasingRisk(viewState) &&
    afterCollateralizationRatioAtNextPrice.lt(activeCollRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const vaultWillRemainUnderMinActiveColRatio =
    !inputAmountsEmpty &&
    (vaultWillRemainUnderMinActiveColRatioAtCurrentPrice ||
      vaultWillRemainUnderMinActiveColRatioAtNextPrice)

  return {
    ...viewState,
    vaultWillBeTakenUnderMinActiveColRatio:
      vaultWillBeTakenUnderMinActiveColRatioAtCurrentPrice ||
      vaultWillBeTakenUnderMinActiveColRatioAtNextPrice,
    vaultIsCurrentlyUnderMinActiveColRatio:
      vaultIsCurrentlyUnderMinActiveColRatioAtCurrentPrice ||
      vaultIsCurrentlyUnderMinActiveColRatioAtNextPrice,
    vaultWillRemainUnderMinActiveColRatio,
  }
}

export const InstitutionalBorrowManageVaultViewStateProvider: BorrowManageVaultViewStateProviderInterface<
  InstiVault,
  ManageInstiVaultState
> = {
  addErrorsAndWarnings(viewState: ManageInstiVaultState): ManageInstiVaultState {
    return {
      ...viewState,
      warningMessages: [
        ...viewState.warningMessages,
        ...(viewState.vaultIsCurrentlyUnderMinActiveColRatio
          ? ['vaultIsCurrentlyUnderMinActiveColRatio' as const]
          : []),
        ...(viewState.vaultWillRemainUnderMinActiveColRatio
          ? ['vaultWillRemainUnderMinActiveColRatio' as const]
          : []),
      ],
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
    const s11 = applyMinActiveColRatioConditions(s10)
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
