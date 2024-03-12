import type BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import type { Dispatch, FC, SetStateAction } from 'react'
import React from 'react'
import { Box, Divider, Flex, Image, Text } from 'theme-ui'

interface OmniPartialTakeProfitOverviewDetailsSectionFooterProps {
  liquidationPrice: BigNumber
  loanToValue: BigNumber
  multiple: BigNumber
  priceFormat: string
  simpleView: boolean
  chartView: 'price' | 'ltv'
  setChartView: Dispatch<SetStateAction<'price' | 'ltv'>>
}

export const OmniPartialTakeProfitOverviewDetailsSectionFooter: FC<
  OmniPartialTakeProfitOverviewDetailsSectionFooterProps
> = ({
  liquidationPrice,
  loanToValue,
  priceFormat,
  multiple,
  simpleView,
  chartView,
  setChartView,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <DetailsSectionFooterItemWrapper>
        <DetailsSectionFooterItem
          title={t('omni-kit.content-card.liquidation-price.title')}
          value={`${formatCryptoBalance(liquidationPrice)} ${priceFormat}`}
        />
        <DetailsSectionFooterItem
          title={t('omni-kit.headline.details.current-ltv')}
          value={formatDecimalAsPercent(loanToValue)}
        />
        <DetailsSectionFooterItem title={t('multiple')} value={`${multiple.toFixed(2)}x`} />
      </DetailsSectionFooterItemWrapper>
      {!simpleView && (
        <Box
          sx={{
            border: 'lightMuted',
            borderRadius: 'large',
            p: 3,
            mt: 4,
          }}
        >
          <ActionPills
            active={chartView}
            variant="secondary"
            items={[
              {
                id: 'price',
                action: () => setChartView('price'),
                label: 'Price',
              },
              {
                id: 'ltv',
                action: () => setChartView('ltv'),
                label: 'LTV',
              },
            ]}
            wrapperSx={{
              mt: 2,
            }}
          />
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Image src={staticFilesRuntimeUrl(`/static/img/take-profit-chart-${chartView}.svg`)} />
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Text variant="boldParagraph3">{t('partial-take-profit.overview.footer.title')}</Text>
            <br />
            <Text variant="paragraph3">{t('partial-take-profit.overview.footer.description')}</Text>
            <Flex sx={{ flexDirection: 'row', mt: 3 }}>
              <AppLink href={EXTERNAL_LINKS.HOW_TO_SET_UP_AUTO_TAKE_PROFIT_VIDEO} sx={{ mr: 5 }}>
                <WithArrow sx={{ color: 'interactive100' }}>Watch tutorial</WithArrow>
              </AppLink>
              <AppLink href={EXTERNAL_LINKS.BLOG.HOW_TO_SET_UP_AUTO_TAKE_PROFIT} sx={{ mr: 5 }}>
                <WithArrow sx={{ color: 'interactive100' }}>Read article</WithArrow>
              </AppLink>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}
