import { ActionPills } from 'components/ActionPills'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Divider, Flex, Image, Text } from 'theme-ui'

export const AavePartialTakeProfitManageDetails = ({
  aaveLikePartialTakeProfitParams,
  aaveLikePartialTakeProfitLambdaData,
}: {
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
}) => {
  const { t } = useTranslation()
  const [chartView, setChartView] = useState<'price' | 'ltv'>('price')

  const {
    partialTakeProfitTokenData,
    partialTakeProfitSecondTokenData,
    priceFormat,
    liquidationPrice,
    priceDenominationToken,
    currentLtv,
    currentMultiple,
    startingTakeProfitPrice,
  } = aaveLikePartialTakeProfitParams
  const { startingTakeProfitPrice: lambdaStartingTakeProfitPrice, triggerLtv: lambdaTriggerLtv } =
    aaveLikePartialTakeProfitLambdaData

  return (
    <>
      <DetailsSection
        title={t('system.partial-take-profit')}
        badge={true}
        content={
          <DetailsSectionContentCardWrapper>
            <OmniContentCard
              title={'Next Dynamic Trigger Price'}
              value={
                lambdaStartingTakeProfitPrice
                  ? formatCryptoBalance(lambdaStartingTakeProfitPrice)
                  : '-'
              }
              unit={priceFormat}
              change={
                !startingTakeProfitPrice.eq(lambdaStartingTakeProfitPrice || zero)
                  ? [`${formatCryptoBalance(startingTakeProfitPrice)} ${priceFormat} after`]
                  : undefined
              }
              changeVariant="positive"
              footnote={[`TriggerLTV: ${lambdaTriggerLtv}%`]}
            />
            <OmniContentCard
              title={'Est. to receive next trigger'}
              value={'-'}
              unit={partialTakeProfitTokenData.symbol}
              change={[`100 ${partialTakeProfitTokenData.symbol} after`]}
              changeVariant="positive"
              footnote={[`Bazillion ${partialTakeProfitSecondTokenData.symbol}`]}
            />
            <OmniContentCard
              title={'Current profit/loss'}
              value={'-'}
              unit={partialTakeProfitTokenData.symbol}
              footnote={[`0 ${partialTakeProfitSecondTokenData.symbol}`]}
            />
            <OmniContentCard
              title={'Profit realized to wallet'}
              value={'-'}
              unit={partialTakeProfitTokenData.symbol}
              footnote={[`0 ${partialTakeProfitSecondTokenData.symbol}`]}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <>
            <DetailsSectionFooterItemWrapper>
              <DetailsSectionFooterItem
                title={'Liquidation price'}
                value={`${formatAmount(liquidationPrice, priceDenominationToken)} ${priceFormat}`}
              />
              <DetailsSectionFooterItem
                title={'Current Loan to Value'}
                value={formatDecimalAsPercent(currentLtv)}
              />
              <DetailsSectionFooterItem
                title={'Current Multiple'}
                value={`${currentMultiple.toFixed(2)}x`}
              />
            </DetailsSectionFooterItemWrapper>
            <Box
              sx={{
                border: 'lightMuted',
                borderRadius: 'large',
                p: 3,
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
                {chartView === 'price' ? (
                  <Image src={staticFilesRuntimeUrl('/static/img/take-profit-chart-price.svg')} />
                ) : (
                  <Image src={staticFilesRuntimeUrl('/static/img/take-profit-chart-ltv.svg')} />
                )}
              </Box>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Text variant="boldParagraph3">Need help setting up auto take profit? </Text>
                <br />
                <Text variant="paragraph3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mollis condimentum congue
                  bibendum ipsum ut.
                </Text>
                <Flex sx={{ flexDirection: 'row', mt: 3 }}>
                  <AppLink href="/#" sx={{ mr: 5 }}>
                    <WithArrow sx={{ color: 'interactive100' }}>Watch tutorial</WithArrow>
                  </AppLink>
                  <AppLink href="/#" sx={{ mr: 5 }}>
                    <WithArrow sx={{ color: 'interactive100' }}>Read article</WithArrow>
                  </AppLink>
                </Flex>
              </Box>
            </Box>
          </>
        }
      />
    </>
  )
}
