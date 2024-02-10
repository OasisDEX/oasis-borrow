import { Steps } from 'components/Steps'
import { omniLendingPriceColors } from 'features/omni-kit/constants'
import type { PositionDetailLendingRange } from 'handlers/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

export const PortfolioPositionBlockLendingRangeDetail = ({
  detail,
}: {
  detail: PositionDetailLendingRange
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <>
      <Text variant="boldParagraph1" sx={{ color: omniLendingPriceColors[detail.value] }}>
        {tPortfolio(`lending-range-types.${detail.value}`)}
      </Text>
      <Box sx={{ mt: 1 }}>
        <Steps count={3} active={detail.value} color={omniLendingPriceColors[detail.value]} />
      </Box>
    </>
  )
}
