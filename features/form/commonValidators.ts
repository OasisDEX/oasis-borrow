import type { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { AutomationKinds } from 'features/automation/common/types'
import { mapAutomationEvents } from 'features/vaultHistory/vaultHistory'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { isNullish } from 'helpers/functions'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

type CollateralAllowanceRadio = 'unlimited' | 'depositAmount' | 'custom'
type DaiAllowanceRadio = 'unlimited' | 'actionAmount' | 'custom'

export function vaultWillBeAtRiskLevelDangerValidator({
  inputAmountsEmpty,
  afterCollateralizationRatio,
  liquidationRatio,
  collateralizationDangerThreshold,
}: {
  inputAmountsEmpty: boolean
  afterCollateralizationRatio: BigNumber
  liquidationRatio: BigNumber
  collateralizationDangerThreshold: BigNumber
}) {
  return (
    !inputAmountsEmpty &&
    afterCollateralizationRatio.gte(liquidationRatio) &&
    afterCollateralizationRatio.lte(collateralizationDangerThreshold)
  )
}

export function vaultWillBeAtRiskLevelDangerAtNextPriceValidator({
  vaultWillBeAtRiskLevelDanger,
  inputAmountsEmpty,
  afterCollateralizationRatioAtNextPrice,
  liquidationRatio,
  collateralizationDangerThreshold,
}: {
  vaultWillBeAtRiskLevelDanger: boolean
  inputAmountsEmpty: boolean
  afterCollateralizationRatioAtNextPrice: BigNumber
  liquidationRatio: BigNumber
  collateralizationDangerThreshold: BigNumber
}) {
  return (
    !vaultWillBeAtRiskLevelDanger &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.gte(liquidationRatio) &&
    afterCollateralizationRatioAtNextPrice.lte(collateralizationDangerThreshold)
  )
}

export function vaultWillBeAtRiskLevelWarningValidator({
  inputAmountsEmpty,
  afterCollateralizationRatio,
  collateralizationDangerThreshold,
  collateralizationWarningThreshold,
}: {
  inputAmountsEmpty: boolean
  afterCollateralizationRatio: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
}) {
  return (
    !inputAmountsEmpty &&
    afterCollateralizationRatio.gt(collateralizationDangerThreshold) &&
    afterCollateralizationRatio.lte(collateralizationWarningThreshold)
  )
}

export function vaultWillBeAtRiskLevelWarningAtNextPriceValidator({
  vaultWillBeAtRiskLevelWarning,
  inputAmountsEmpty,
  afterCollateralizationRatioAtNextPrice,
  collateralizationDangerThreshold,
  collateralizationWarningThreshold,
}: {
  vaultWillBeAtRiskLevelWarning: boolean
  inputAmountsEmpty: boolean
  afterCollateralizationRatioAtNextPrice: BigNumber
  collateralizationDangerThreshold: BigNumber
  collateralizationWarningThreshold: BigNumber
}) {
  return (
    !vaultWillBeAtRiskLevelWarning &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.gt(collateralizationDangerThreshold) &&
    afterCollateralizationRatioAtNextPrice.lte(collateralizationWarningThreshold)
  )
}

export function depositingAllEthBalanceValidator({
  token,
  depositAmount,
  collateralBalance,
}: {
  token: string
  depositAmount?: BigNumber
  collateralBalance: BigNumber
}) {
  return token === 'ETH' && !!depositAmount?.eq(collateralBalance)
}

export function notEnoughETHtoPayForTx({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  depositAmount,
}: {
  ethBalance: BigNumber
  ethPrice: BigNumber
  token?: string
  gasEstimationUsd?: BigNumber
  depositAmount?: BigNumber
}) {
  if (!gasEstimationUsd) {
    return false
  }

  if (depositAmount && !depositAmount.isZero() && token === 'ETH') {
    return (
      ethBalance.minus(depositAmount).times(ethPrice).lt(gasEstimationUsd) ||
      ethBalance.eq(depositAmount)
    )
  }

  return ethBalance.times(ethPrice).lt(gasEstimationUsd)
}

export function customAllowanceAmountEmptyValidator({
  selectedAllowanceRadio,
  allowanceAmount,
}: {
  selectedAllowanceRadio: CollateralAllowanceRadio
  allowanceAmount?: BigNumber
}) {
  return selectedAllowanceRadio === 'custom' && !allowanceAmount
}

export function customAllowanceAmountExceedsMaxUint256Validator({
  selectedAllowanceRadio,
  allowanceAmount,
}: {
  selectedAllowanceRadio: CollateralAllowanceRadio
  allowanceAmount?: BigNumber
}) {
  return !!(selectedAllowanceRadio === 'custom' && allowanceAmount?.gt(maxUint256))
}

export function customAllowanceAmountLessThanDepositAmountValidator({
  selectedAllowanceRadio,
  allowanceAmount,
  depositAmount,
}: {
  selectedAllowanceRadio: CollateralAllowanceRadio
  allowanceAmount?: BigNumber
  depositAmount?: BigNumber
}) {
  return !!(
    selectedAllowanceRadio === 'custom' &&
    allowanceAmount &&
    depositAmount &&
    allowanceAmount.lt(depositAmount)
  )
}

export function ledgerWalletContractDataDisabledValidator({ txError }: { txError?: TxError }) {
  return txError?.name === 'EthAppPleaseEnableContractData'
}

export function ethFundsForTxValidator({ txError }: { txError?: TxError }) {
  return txError?.message === 'insufficient funds for gas * price + value'
}

export function debtIsLessThanDebtFloorValidator({
  debt,
  debtFloor,
}: {
  debt: BigNumber
  debtFloor: BigNumber
}) {
  return debt.lt(debtFloor) && debt.gt(zero)
}

export function depositAndWithdrawAmountsEmptyValidator({
  depositAmount,
  withdrawAmount,
}: {
  depositAmount?: BigNumber
  withdrawAmount?: BigNumber
}) {
  return isNullish(depositAmount) && isNullish(withdrawAmount)
}

export function generateAndPaybackAmountsEmptyValidator({
  generateAmount,
  paybackAmount,
}: {
  generateAmount?: BigNumber
  paybackAmount?: BigNumber
}) {
  return isNullish(generateAmount) && isNullish(paybackAmount)
}

export function accountIsConnectedValidator({ account }: { account?: string }) {
  return !!account
}

export function accountIsControllerValidator({
  account,
  accountIsConnected,
  controller,
}: {
  account?: string
  accountIsConnected: boolean
  controller?: string
}) {
  return accountIsConnected ? account === controller : true
}

export function withdrawAmountExceedsFreeCollateralValidator({
  withdrawAmount,
  maxWithdrawAmountAtCurrentPrice,
}: {
  withdrawAmount?: BigNumber
  maxWithdrawAmountAtCurrentPrice: BigNumber
}) {
  return !!withdrawAmount?.gt(maxWithdrawAmountAtCurrentPrice)
}

export function withdrawAmountExceedsFreeCollateralAtNextPriceValidator({
  withdrawAmountExceedsFreeCollateral,
  withdrawAmount,
  maxWithdrawAmountAtNextPrice,
}: {
  withdrawAmountExceedsFreeCollateral?: boolean
  withdrawAmount?: BigNumber
  maxWithdrawAmountAtNextPrice: BigNumber
}) {
  return !withdrawAmountExceedsFreeCollateral && !!withdrawAmount?.gt(maxWithdrawAmountAtNextPrice)
}

export function paybackAmountExceedsDaiBalanceValidator({
  paybackAmount,
  daiBalance,
}: {
  paybackAmount?: BigNumber
  daiBalance: BigNumber
}) {
  return !!paybackAmount?.gt(daiBalance)
}

export function paybackAmountExceedsVaultDebtValidator({
  paybackAmount,
  debt,
}: {
  paybackAmount?: BigNumber
  debt: BigNumber
}) {
  return !!paybackAmount?.gt(debt)
}

export function customCollateralAllowanceAmountEmptyValidator({
  selectedCollateralAllowanceRadio,
  collateralAllowanceAmount,
}: {
  selectedCollateralAllowanceRadio: CollateralAllowanceRadio
  collateralAllowanceAmount?: BigNumber
}) {
  return selectedCollateralAllowanceRadio === 'custom' && !collateralAllowanceAmount
}

export function customDaiAllowanceAmountEmptyValidator({
  selectedDaiAllowanceRadio,
  daiAllowanceAmount,
}: {
  selectedDaiAllowanceRadio: DaiAllowanceRadio
  daiAllowanceAmount?: BigNumber
}) {
  return selectedDaiAllowanceRadio === 'custom' && !daiAllowanceAmount
}

export function customCollateralAllowanceAmountExceedsMaxUint256Validator({
  selectedCollateralAllowanceRadio,
  collateralAllowanceAmount,
}: {
  selectedCollateralAllowanceRadio: CollateralAllowanceRadio
  collateralAllowanceAmount?: BigNumber
}) {
  return !!(
    selectedCollateralAllowanceRadio === 'custom' && collateralAllowanceAmount?.gt(maxUint256)
  )
}

export function customCollateralAllowanceAmountLessThanDepositAmountValidator({
  selectedCollateralAllowanceRadio,
  collateralAllowanceAmount,
  depositAmount,
}: {
  selectedCollateralAllowanceRadio: CollateralAllowanceRadio
  collateralAllowanceAmount?: BigNumber
  depositAmount?: BigNumber
}) {
  return !!(
    selectedCollateralAllowanceRadio === 'custom' &&
    collateralAllowanceAmount &&
    depositAmount &&
    collateralAllowanceAmount.lt(depositAmount)
  )
}

export function customDaiAllowanceAmountExceedsMaxUint256Validator({
  selectedDaiAllowanceRadio,
  daiAllowanceAmount,
}: {
  selectedDaiAllowanceRadio: DaiAllowanceRadio
  daiAllowanceAmount?: BigNumber
}) {
  return !!(selectedDaiAllowanceRadio === 'custom' && daiAllowanceAmount?.gt(maxUint256))
}

export function customDaiAllowanceAmountLessThanPaybackAmountValidator({
  selectedDaiAllowanceRadio,
  daiAllowanceAmount,
  paybackAmount,
}: {
  selectedDaiAllowanceRadio: DaiAllowanceRadio
  daiAllowanceAmount?: BigNumber
  paybackAmount?: BigNumber
}) {
  return !!(
    selectedDaiAllowanceRadio === 'custom' &&
    daiAllowanceAmount &&
    paybackAmount &&
    daiAllowanceAmount.lt(paybackAmount)
  )
}

export function insufficientCollateralAllowanceValidator({
  token,
  depositAmount,
  collateralAllowance,
}: {
  token: string
  depositAmount?: BigNumber
  collateralAllowance?: BigNumber
}) {
  return !!(
    token !== 'ETH' &&
    depositAmount &&
    !depositAmount.isZero() &&
    (!collateralAllowance || depositAmount.gt(collateralAllowance))
  )
}

export function insufficientDaiAllowanceValidator({
  paybackAmount,
  depositDaiAmount,
  daiAllowance,
  debtOffset,
}: {
  paybackAmount?: BigNumber
  depositDaiAmount?: BigNumber
  daiAllowance?: BigNumber
  debtOffset: BigNumber
}) {
  const amountToValidate = paybackAmount?.gt(zero)
    ? paybackAmount
    : depositDaiAmount?.gt(zero)
    ? depositDaiAmount
    : zero

  return !!(
    amountToValidate &&
    !amountToValidate.isZero() &&
    (!daiAllowance || amountToValidate.plus(debtOffset).gt(daiAllowance))
  )
}

export function withdrawCollateralOnVaultUnderDebtFloorValidator({
  debt,
  debtFloor,
  withdrawAmount,
  paybackAmount,
}: {
  debt: BigNumber
  debtFloor: BigNumber
  withdrawAmount?: BigNumber
  paybackAmount?: BigNumber
}) {
  return (
    debt.gt(zero) &&
    debt.lt(debtFloor) &&
    withdrawAmount !== undefined &&
    withdrawAmount.gt(zero) &&
    (paybackAmount === undefined || paybackAmount.lt(debt))
  )
}

export function collateralAllowanceProgressionDisabledValidator({
  isCollateralAllowanceStage,
  customCollateralAllowanceAmountEmpty,
  customCollateralAllowanceAmountExceedsMaxUint256,
  customCollateralAllowanceAmountLessThanDepositAmount,
}: {
  isCollateralAllowanceStage: boolean
  customCollateralAllowanceAmountEmpty: boolean
  customCollateralAllowanceAmountExceedsMaxUint256?: boolean
  customCollateralAllowanceAmountLessThanDepositAmount?: boolean
}) {
  return (
    isCollateralAllowanceStage &&
    (customCollateralAllowanceAmountEmpty ||
      customCollateralAllowanceAmountExceedsMaxUint256 ||
      customCollateralAllowanceAmountLessThanDepositAmount)
  )
}

export function daiAllowanceProgressionDisabledValidator({
  isDaiAllowanceStage,
  customDaiAllowanceAmountEmpty,
  customDaiAllowanceAmountExceedsMaxUint256,
  customDaiAllowanceAmountLessThanPaybackAmount,
}: {
  isDaiAllowanceStage: boolean
  customDaiAllowanceAmountEmpty: boolean
  customDaiAllowanceAmountExceedsMaxUint256?: boolean
  customDaiAllowanceAmountLessThanPaybackAmount?: boolean
}) {
  return (
    isDaiAllowanceStage &&
    (customDaiAllowanceAmountEmpty ||
      customDaiAllowanceAmountExceedsMaxUint256 ||
      customDaiAllowanceAmountLessThanPaybackAmount)
  )
}

export function afterCollRatioThresholdRatioValidator({
  afterCollateralizationRatio,
  afterCollateralizationRatioAtNextPrice,
  threshold,
  type,
}: {
  afterCollateralizationRatio: BigNumber
  afterCollateralizationRatioAtNextPrice: BigNumber
  threshold: BigNumber
  type: 'below' | 'above'
}) {
  if (afterCollateralizationRatio.isZero() || afterCollateralizationRatioAtNextPrice.isZero()) {
    return false
  }

  switch (type) {
    case 'below':
      return (
        afterCollateralizationRatio.lt(threshold) ||
        afterCollateralizationRatioAtNextPrice.lte(threshold)
      )
    case 'above':
      return (
        afterCollateralizationRatio.gt(threshold) ||
        afterCollateralizationRatioAtNextPrice.gte(threshold)
      )
    default:
      return false
  }
}

export function vaultEmptyNextPriceAboveOrBelowTakeProfitPriceValidator({
  debt,
  afterDebt,
  nextCollateralPrice,
  type,
  isTriggerEnabled,
  executionPrice,
}: {
  debt: BigNumber
  afterDebt: BigNumber
  nextCollateralPrice: BigNumber
  type: 'below' | 'above'
  isTriggerEnabled?: boolean
  executionPrice?: BigNumber
}) {
  if (!(isTriggerEnabled && executionPrice && debt.isZero() && !afterDebt.isZero())) {
    return false
  }

  switch (type) {
    case 'above':
      return nextCollateralPrice.gte(executionPrice)
    case 'below':
      return nextCollateralPrice.lt(executionPrice)

    default:
      return false
  }
}

export function automationTriggeredValidator({
  vaultHistory,
}: {
  vaultHistory: VaultHistoryEvent[]
}) {
  const notTriggered = {
    stopLossTriggered: false,
    autoTakeProfitTriggered: false,
  }

  if (!vaultHistory.length) {
    return notTriggered
  }

  const mappedAuto = mapAutomationEvents(vaultHistory)
  const potentialExecutionEvent = mappedAuto[0]

  if (
    !('autoKind' in potentialExecutionEvent) ||
    potentialExecutionEvent.eventType !== 'executed'
  ) {
    return notTriggered
  }

  return {
    stopLossTriggered: potentialExecutionEvent.autoKind === AutomationKinds.STOP_LOSS,
    autoTakeProfitTriggered: potentialExecutionEvent.autoKind === AutomationKinds.AUTO_TAKE_PROFIT,
  }
}
