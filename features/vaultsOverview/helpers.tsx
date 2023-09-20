import type BigNumber from 'bignumber.js'
import type { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import type { Dsr } from 'features/dsr/utils/createDsr'
import type { AaveLikePosition } from 'features/vaultsOverview/pipes/positions'
import type { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
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

export function getMakerPositionOfType(positions: MakerPositionDetails[]) {
  return positions.reduce<{
    borrow: MakerPositionDetails[]
    multiply: MakerPositionDetails[]
    earn: MakerPositionDetails[]
  }>(
    (v, position) => {
      if (position.token === 'GUNIV3DAIUSDC1' || position.token === 'GUNIV3DAIUSDC2')
        v.earn.push(position)
      else if (position.type === 'borrow') v.borrow.push(position)
      else if (position.type === 'multiply') v.multiply.push(position)

      return v
    },
    { borrow: [], multiply: [], earn: [] },
  )
}

export function getAavePositionOfType(positions: AaveLikePosition[]) {
  return positions.reduce<{
    multiply: AaveLikePosition[]
    earn: AaveLikePosition[]
    borrow: AaveLikePosition[]
  }>(
    (v, position) => {
      if (position.type === 'earn') v.earn.push(position)
      else if (position.type === 'multiply') v.multiply.push(position)
      else if (position.type === 'borrow') v.borrow.push(position)
      return v
    },
    { multiply: [], earn: [], borrow: [] },
  )
}

export function getAjnaPositionOfType(positions: AjnaPositionDetails[]) {
  return positions.reduce<{
    borrow: AjnaPositionDetails[]
    earn: AjnaPositionDetails[]
    multiply: AjnaPositionDetails[]
  }>(
    (v, position) => {
      if (position.details.product === 'borrow') v.borrow.push(position)
      else if (position.details.product === 'earn') v.earn.push(position)
      else if (position.details.product === 'multiply') v.multiply.push(position)

      return v
    },
    { borrow: [], earn: [], multiply: [] },
  )
}
