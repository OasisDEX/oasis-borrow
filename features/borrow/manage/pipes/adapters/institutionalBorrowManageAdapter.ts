import BigNumber from 'bignumber.js'
import { InstiVault } from 'blockchain/instiVault'

import { collateralPriceAtRatio } from '../../../../../blockchain/vault.maths'
import { zero } from '../../../../../helpers/zero'
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
  BorrowManageAdapterInterface,
  CreateInitialVaultStateArgs,
} from './borrowManageAdapterInterface'
import { StandardBorrowManageAdapter } from './standardBorrowManageAdapter'

export type ManageInstiVaultState = GenericManageBorrowVaultState<InstiVault> & {
  transactionFeeETH?: BigNumber
  originationFeeUSD?: BigNumber
  vaultWillBeTakenUnderMinActiveColRatio?: boolean
  vaultIsCurrentlyUnderMinActiveColRatio?: boolean
  vaultWillRemainUnderMinActiveColRatio?: boolean
  afterActiveCollRatioPriceUSD?: BigNumber
}

type RiskArgs = {
  inputAmountsEmpty: boolean
  afterCollateralizationRatioAtNextPrice: BigNumber
  afterCollateralizationRatio: BigNumber
  vault: {
    collateralizationRatioAtNextPrice: BigNumber
    collateralizationRatio: BigNumber
  }
}

function checkColRatioShiftIncreasesPositionRisk(
  currentColRatio: BigNumber,
  newColRatio: BigNumber,
) {
  return (newColRatio.lt(currentColRatio) && !newColRatio.eq(zero)) || currentColRatio.eq(zero)
}

export function increasingRisk(args: RiskArgs): boolean {
  return (
    !args.inputAmountsEmpty &&
    (checkColRatioShiftIncreasesPositionRisk(
      args.vault.collateralizationRatioAtNextPrice,
      args.afterCollateralizationRatioAtNextPrice,
    ) ||
      checkColRatioShiftIncreasesPositionRisk(
        args.vault.collateralizationRatio,
        args.afterCollateralizationRatio,
      ))
  )
}

function applyMinActiveColRatioConditions(viewState: ManageInstiVaultState): ManageInstiVaultState {
  const {
    isEditingStage,
    inputAmountsEmpty,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    vault: { activeCollRatio, collateralizationRatio, collateralizationRatioAtNextPrice },
  } = viewState

  const vaultWillBeTakenUnderMinActiveColRatioAtCurrentPrice =
    !inputAmountsEmpty &&
    increasingRisk(viewState) &&
    afterCollateralizationRatio.lt(activeCollRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeTakenUnderMinActiveColRatioAtNextPrice =
    !inputAmountsEmpty &&
    increasingRisk(viewState) &&
    afterCollateralizationRatioAtNextPrice.lt(activeCollRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const vaultIsCurrentlyUnderMinActiveColRatioAtCurrentPrice =
    collateralizationRatio.lt(activeCollRatio) && collateralizationRatio.gt(zero)
  const vaultIsCurrentlyUnderMinActiveColRatioAtNextPrice =
    collateralizationRatioAtNextPrice.lt(activeCollRatio) && collateralizationRatio.gt(zero)

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
      isEditingStage &&
      (vaultWillBeTakenUnderMinActiveColRatioAtCurrentPrice ||
        vaultWillBeTakenUnderMinActiveColRatioAtNextPrice),
    vaultIsCurrentlyUnderMinActiveColRatio:
      vaultIsCurrentlyUnderMinActiveColRatioAtCurrentPrice ||
      vaultIsCurrentlyUnderMinActiveColRatioAtNextPrice,
    vaultWillRemainUnderMinActiveColRatio: isEditingStage && vaultWillRemainUnderMinActiveColRatio,
  }
}

export const InstitutionalBorrowManageAdapter: BorrowManageAdapterInterface<
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

  transformViewState(
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
    const s8 = applyManageVaultCalculations(
      s7,
      viewState.vault.originationFeePercent,
      viewState.vault.activeCollRatio,
    )
    const s9 = applyManageVaultStageCategorisation<ManageInstiVaultState>(s8)
    const s10 = applyManageVaultConditions(s9)
    const s11 = applyMinActiveColRatioConditions(s10)
    return applyManageVaultSummary(s11)
  },

  addTxnCost(viewState: ManageInstiVaultState): ManageInstiVaultState {
    // for origination fee, assume if generate amount not set we are generating 0 DAI
    const generateAmount = viewState.generateAmount || zero

    const originationFeeUSD = generateAmount.times(viewState.vault.originationFeePercent)

    const transactionFeeUsd = originationFeeUSD?.plus(viewState.gasEstimationUsd!)

    const transactionFeeETH = transactionFeeUsd?.div(viewState.priceInfo.currentEthPrice!)

    const afterActiveCollRatioPriceUSD = collateralPriceAtRatio({
      colRatio: viewState.vault.activeCollRatio,
      collateral: viewState.afterLockedCollateral,
      vaultDebt: viewState.afterDebt,
    })

    return {
      ...viewState,
      originationFeeUSD,
      transactionFeeETH,
      afterActiveCollRatioPriceUSD,
    }
  },

  createInitialViewState(args: CreateInitialVaultStateArgs<InstiVault>): ManageInstiVaultState {
    const manageStandardVaultViewState: ManageStandardBorrowVaultState = {
      ...StandardBorrowManageAdapter.createInitialViewState(args),
      vault: args.vault,
    }
    return {
      ...manageStandardVaultViewState,
      vault: args.vault,
      originationFeeUSD: undefined,
    }
  },
}
