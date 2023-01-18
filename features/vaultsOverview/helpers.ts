import BigNumber from 'bignumber.js'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { calculatePNL } from 'helpers/multiply/calculations'
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
  'variable',
  'vaultDebt',
]
export const followTableSkippedHeaders = ['ilk', 'isOwner']

function getFundingCost({
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

function getMakerPositionOfType(position: MakerPositionDetails[]) {
  return position.reduce<{
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

export function getMakerBorrowPositions(positions: MakerPositionDetails[]) {
  return getMakerPositionOfType(positions).borrow.map(
    ({
      atRiskLevelDanger,
      atRiskLevelWarning,
      collateralizationRatio,
      debt,
      id,
      ilk,
      isOwner,
      lockedCollateral,
      stabilityFee,
      token,
    }) => ({
      asset: token,
      ilk,
      isOwner,
      colRatio: {
        level: collateralizationRatio.times(100).toNumber(),
        isAtRiskDanger: atRiskLevelDanger,
        isAtRiskWarning: atRiskLevelWarning,
      },
      vaultDebt: debt.toNumber(),
      collateralLocked: lockedCollateral.toNumber(),
      variable: stabilityFee.times(100).toNumber(),
      cdpId: id.toNumber(),
    }),
  )
}

export function getMakerMultiplyPositions(positions: MakerPositionDetails[]) {
  return getMakerPositionOfType(positions).multiply.map(
    ({
      debt,
      id,
      ilk,
      isOwner,
      liquidationPrice,
      lockedCollateralUSD,
      stabilityFee,
      token,
      value,
    }) => ({
      asset: token,
      ilk,
      isOwner,
      netUSDValue: value.toNumber(),
      currentMultiple: calculateMultiply({ debt, lockedCollateralUSD }).toNumber(),
      liquidationPrice: liquidationPrice.toNumber(),
      fundingCost: getFundingCost({ debt, stabilityFee, value }).toNumber(),
      cdpId: id.toNumber(),
    }),
  )
}

export function getMakerEarnPositions(positions: MakerPositionDetails[]) {
  return getMakerPositionOfType(positions).earn.map(
    ({ debt, history, id, ilk, ilkDebtAvailable, isOwner, lockedCollateralUSD, token, value }) => {
      return {
        asset: token,
        ilk,
        isOwner,
        netUSDValue: value.toNumber(),
        pnl: calculatePNL(history, lockedCollateralUSD.minus(debt)).times(100).toNumber(),
        liquidity: ilkDebtAvailable.toNumber(),
        cdpId: id.toNumber(),
      }
    },
  )
}
