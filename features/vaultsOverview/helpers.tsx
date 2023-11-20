import type BigNumber from 'bignumber.js'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { Dsr } from 'features/dsr/utils/createDsr'
import { zero } from 'helpers/zero'

export const positionsTableTooltips = [
  'collateralLocked',
  'colRatio',
  'currentMultiple',
  'fundingCost',
  'liquidationPrice',
  'liquidity',
  'netUSDValue',
  'pnl',
  'protection',
  'variable',
  'vaultDebt',
]

export function getDsrValue(dsr?: Dsr): BigNumber {
  return dsr?.pots.dsr.value && 'dai' in dsr?.pots.dsr.value ? dsr.pots.dsr.value.dai : zero
}

export function getFundingCost({
  debt,
  stabilityFee,
  value,
}: {
  debt: BigNumber
  stabilityFee: BigNumber
  value: BigNumber
}) {
  return value.gt(zero) ? debt.div(value).multipliedBy(stabilityFee).times(100) : zero
}

export function getProtection({
  stopLossData,
  autoSellData,
}: {
  stopLossData?: StopLossTriggerData
  autoSellData?: AutoBSTriggerData
}): number {
  return stopLossData
    ? (stopLossData?.stopLossLevel.gt(zero)
        ? stopLossData.stopLossLevel.times(100)
        : autoSellData?.execCollRatio.gt(zero)
        ? autoSellData.execCollRatio
        : zero
      ).toNumber()
    : zero.toNumber()
}
