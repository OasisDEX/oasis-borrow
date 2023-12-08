import { Steps } from 'components/Steps'
import { omniLendingPriceColors } from 'features/omni-kit/constants'
import type { PositionDetailLendingRange } from 'handlers/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'

export const PortfolioPositionBlockLendingRangeDetail = ({
  detail,
}: {
  detail: PositionDetailLendingRange
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <>
      {tPortfolio(`lending-range-types.${detail.value}`)}
      <Box sx={{ mt: 1 }}>
        <Steps count={3} active={detail.value} color={omniLendingPriceColors[detail.value]} />
      </Box>
    </>
  )
}
