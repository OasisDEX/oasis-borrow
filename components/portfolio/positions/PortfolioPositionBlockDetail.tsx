import { Icon } from 'components/Icon'
import { getPortfolioAccentColor } from 'components/portfolio/helpers/getPortfolioAccentColor'
import { StatefulTooltip } from 'components/Tooltip'
import type { DetailsType, PositionDetail } from 'features/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'
import { question_o } from 'theme/icons'

export const PortfolioPositionBlockDetail = ({ detail }: { detail: PositionDetail }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const detailsTooltipsMap: Record<DetailsType, string> = {
    netValue: tPortfolio('details-tooltips.netValue'),
    pnl: tPortfolio('details-tooltips.pnl'),
    liquidationPrice: tPortfolio('details-tooltips.liquidationPrice'),
    ltv: tPortfolio('details-tooltips.ltv'),
    multiple: tPortfolio('details-tooltips.multiple'),
    collateralLocked: tPortfolio('details-tooltips.collateralLocked'),
    totalDebt: tPortfolio('details-tooltips.totalDebt'),
    borrowRate: tPortfolio('details-tooltips.borrowRate'),
    lendingRange: tPortfolio('details-tooltips.lendingRange'),
    earnings: tPortfolio('details-tooltips.earnings'),
    apy: tPortfolio('details-tooltips.apy'),
    '90dApy': tPortfolio('details-tooltips.90dApy'),
    suppliedToken: tPortfolio('details-tooltips.suppliedToken'),
    suppliedTokenBalance: tPortfolio('details-tooltips.suppliedTokenBalance'),
    borrowedToken: tPortfolio('details-tooltips.borrowedToken'),
    borrowedTokenBalance: tPortfolio('details-tooltips.borrowedTokenBalance'),
  }
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Box>
        <Text as="p" variant="paragraph4" color="neutral80" sx={{ verticalAlign: 'center' }}>
          {tPortfolio(`position-details.${detail.type}`)}
          {detailsTooltipsMap[detail.type] && (
            <StatefulTooltip
              tooltip={detailsTooltipsMap[detail.type]}
              containerSx={{
                ml: 1,
                mb: '-10px',
                display: 'inline',
                position: 'relative',
                top: '3px',
              }}
              tooltipSx={{
                borderRadius: 'medium',
              }}
            >
              <Icon size={16} icon={question_o} color="neutral80" />
            </StatefulTooltip>
          )}
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
