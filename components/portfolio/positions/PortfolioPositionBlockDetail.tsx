import { getPortfolioAccentColor } from 'components/portfolio/helpers/getPortfolioAccentColor'
import type { PositionDetail } from 'features/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

export const PortfolioPositionBlockDetail = ({ detail }: { detail: PositionDetail }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Box>
        <Text variant="paragraph4" color="neutral80">
          {tPortfolio(`position-details.${detail.type}`)}
        </Text>
      </Box>
      <Text
        variant="boldParagraph1"
        color={detail.accent ? getPortfolioAccentColor(detail.accent) : 'neutral100'}
      >
        {detail.value}
      </Text>
      {detail.subvalue && (
        <Text variant="paragraph4" color="neutral80">
          {detail.subvalue}
        </Text>
      )}
    </Flex>
  )
}
