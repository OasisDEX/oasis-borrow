import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { PositionRaysMultipliersData } from 'features/rays/types'
import { getPositionPortfolioRaysWithBoosts } from 'handlers/portfolio/positions/helpers/getPositionPortfolioRaysWithBoosts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getGradientColor } from 'helpers/getGradientColor'
import { getPointsPerYear } from 'helpers/rays'
import React from 'react'
import { Text } from 'theme-ui'

export const getOmniDetailsSectionRaysTitle = ({
  position,
  positionRaysMultipliersData,
}: {
  position: LendingPosition | SupplyPosition
  positionRaysMultipliersData: PositionRaysMultipliersData
}) => {
  // In general all positions should have `netValue` field since all positions extend either Lending or Supply interface
  const positionNetValue = position && 'netValue' in position ? position.netValue.toNumber() : 0

  const rawRaysPerYear = getPointsPerYear(positionNetValue)

  const raysPerYear = getPositionPortfolioRaysWithBoosts({
    rawRaysPerYear,
    positionRaysMultipliersData,
  })

  return (
    <Text
      variant="paragraph3"
      sx={{
        fontWeight: 'semiBold',
        ...getGradientColor(
          'linear-gradient(270.13deg, #007DA3 0.02%, #E7A77F 56.92%, #E97047 98.44%)',
        ),
      }}
    >
      + {formatCryptoBalance(new BigNumber(raysPerYear))} Rays / year
    </Text>
  )
}
