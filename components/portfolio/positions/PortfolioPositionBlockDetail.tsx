import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { getPortfolioAccentColor } from 'components/portfolio/helpers/getPortfolioAccentColor'
import { PortfolioPositionBlockLendingRangeDetail } from 'components/portfolio/positions/PortfolioPositionBlockLendingRangeDetail'
import { StatefulTooltip } from 'components/Tooltip'
import { WithArrow } from 'components/WithArrow'
import type { DetailsType, PositionDetail } from 'handlers/portfolio/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import type { TranslateStringType } from 'helpers/translateStringType'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { question_o } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'

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
    apyLink: tPortfolio('details-tooltips.apy'),
    '90dApy': tPortfolio('details-tooltips.90dApy'),
    suppliedTokenBalance: tPortfolio('details-tooltips.suppliedTokenBalance'),
    borrowedTokenBalance: tPortfolio('details-tooltips.borrowedTokenBalance'),
  }
  let mainDetailComponent
  switch (detail.type) {
    case 'apyLink':
      mainDetailComponent = (
        <AppLink href={EXTERNAL_LINKS.AAVE_SDAI_YIELD_DUNE}>
          <WithArrow>APY</WithArrow>
        </AppLink>
      )
      break
    case 'lendingRange':
      mainDetailComponent = <PortfolioPositionBlockLendingRangeDetail detail={detail} />
      break
    default:
      mainDetailComponent = detail.value
      break
  }

  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'flex-start', my: [3, 0] }}>
      <Box>
        <Text
          as="div"
          variant="paragraph4"
          color="neutral80"
          sx={{ mb: 1, verticalAlign: 'center' }}
        >
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
                top: 3,
                left: 0,
                width: ['200px', '250px'],
                fontSize: 1,
                fontWeight: 'normal',
                whiteSpace: 'initial',
                textAlign: 'left',
                border: 'none',
                borderRadius: 'medium',
                boxShadow: 'buttonMenu',
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
        {mainDetailComponent}
      </Text>
      {detail.subvalue && (
        <Text variant="paragraph4" color="neutral80">
          {detail.subvalue}
        </Text>
      )}
    </Flex>
  )
}
