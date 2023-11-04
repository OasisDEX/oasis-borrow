import { Icon } from 'components/Icon'
import { getPortfolioAccentColor } from 'components/portfolio/helpers/getPortfolioAccentColor'
import { StatefulTooltip } from 'components/Tooltip'
import type { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { question_o } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'

import type { DetailsType, PositionDetail } from 'lambdas/src/shared/domain-types'

export const PortfolioPositionBlockDetail = ({ detail }: { detail: PositionDetail }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const detailsTooltipsMap: Partial<Record<DetailsType, TranslateStringType>> = {
    netValue: tPortfolio('details-tooltips.netValue'),
    netValueEarnActivePassive: tPortfolio('details-tooltips.netValueEarnActivePassive'),
    liquidationPrice: tPortfolio('details-tooltips.liquidationPrice'),
    ltv: tPortfolio('details-tooltips.ltv'),
    multiple: tPortfolio('details-tooltips.multiple'),
    borrowRate: tPortfolio('details-tooltips.borrowRate'),
    lendingRange: tPortfolio('details-tooltips.lendingRange'),
    apy: tPortfolio('details-tooltips.apy'),
    '90dApy': tPortfolio('details-tooltips.90dApy'),
    suppliedTokenBalance: tPortfolio('details-tooltips.suppliedTokenBalance'),
    borrowedTokenBalance: tPortfolio('details-tooltips.borrowedTokenBalance'),
  }
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Box>
        <Text as="div" variant="paragraph4" color="neutral80" sx={{ verticalAlign: 'center' }}>
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
                width: '230px',
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
