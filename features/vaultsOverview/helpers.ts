import BigNumber from 'bignumber.js'
import { calculateMultiply } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { MakerPositionDetails } from 'features/vaultsOverview/pipes/positionsList'
import { zero } from 'helpers/zero'

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

export function getMakerBorrowPositions(positions: MakerPositionDetails[]) {
  return positions
    .filter((vault) => vault.type === 'borrow')
    .map(
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
  return positions
    .filter((vault) => vault.type === 'multiply')
    .map(
      ({
        id,
        ilk,
        isOwner,
        value,
        token,
        debt,
        lockedCollateralUSD,
        liquidationPrice,
        stabilityFee,
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
