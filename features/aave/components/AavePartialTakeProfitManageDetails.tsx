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
    partialTakeProfitToken,
    priceFormat,
    liquidationPrice,
    priceDenominationToken,
    currentLtv,
    currentMultiple,
    startingTakeProfitPrice,
    triggerLtv,
    partialTakeProfitProfits,
  } = aaveLikePartialTakeProfitParams
  const { startingTakeProfitPrice: lambdaStartingTakeProfitPrice, triggerLtv: lambdaTriggerLtv } =
    aaveLikePartialTakeProfitLambdaData

  const nextTriggerProfit = partialTakeProfitProfits ? partialTakeProfitProfits[0] : undefined

  return (
    <>
      <DetailsSection
        title={t('system.partial-take-profit')}
        badge={!!lambdaTriggerLtv}
        content={
          <DetailsSectionContentCardWrapper>
            <OmniContentCard
              title={'Next Dynamic Trigger Price'}
              value={nextTriggerProfit ? formatCryptoBalance(nextTriggerProfit.triggerPrice) : '-'}
              unit={priceFormat}
              modal={
                <Text>
                  The next price in which you will realize profits to your wallet. It is dynamic
                  because position changes made prior to it triggering may make the trigger price
                  increase.
                </Text>
              }
              modalAsTooltip
              isLoading={!nextTriggerProfit}
              isValueLoading={!nextTriggerProfit}
              change={
                !startingTakeProfitPrice.eq(lambdaStartingTakeProfitPrice || zero)
                  ? [`${formatCryptoBalance(startingTakeProfitPrice)} ${priceFormat} after`]
                  : undefined
              }
              changeVariant={
                lambdaStartingTakeProfitPrice
                  ? lambdaStartingTakeProfitPrice.gte(startingTakeProfitPrice)
                    ? 'positive'
                    : 'negative'
                  : 'positive'
              }
              footnote={[`Trigger LTV: ${lambdaTriggerLtv || triggerLtv.toFixed(2)}%`]}
            />
            <OmniContentCard
              title={'Est. to receive next trigger'}
              modal={
                <Text>
                  The amount of collateral or debt that will be withdrawn to your wallet upon
                  trigger.
                </Text>
              }
              modalAsTooltip
              value={
                nextTriggerProfit
                  ? formatAmount(
                      partialTakeProfitToken === 'debt'
                        ? nextTriggerProfit.realizedProfitInDebt.balance
                        : nextTriggerProfit.realizedProfitInCollateral.balance,
                      partialTakeProfitTokenData.symbol,
                    )
                  : '-'
              }
              isLoading={!nextTriggerProfit}
              isValueLoading={!nextTriggerProfit}
              unit={partialTakeProfitTokenData.symbol}
              change={[`??? ${partialTakeProfitTokenData.symbol}`]}
              changeVariant="positive"
              footnote={
                nextTriggerProfit
                  ? [
                      `${formatAmount(
                        partialTakeProfitToken === 'collateral' // yes, this is the other way around
                          ? nextTriggerProfit.realizedProfitInDebt.balance
                          : nextTriggerProfit.realizedProfitInCollateral.balance,
                        partialTakeProfitSecondTokenData.symbol,
                      )} ${partialTakeProfitSecondTokenData.symbol}`,
                    ]
                  : []
              }
            />
            <OmniContentCard
              title={'Current profit/loss'}
              value={'-'}
              modal={
                <Text>
                  The profit or loss of your position, denominated in collateral, including realized
                  profits to wallet. Specifically, P&L = ((Net value + Cumulative withdrawals) -
                  Cumulative deposits) / Cumulative deposits.
                </Text>
              }
              modalAsTooltip
              unit={partialTakeProfitTokenData.symbol}
              footnote={[`0 ${partialTakeProfitSecondTokenData.symbol}`]}
            />
            <OmniContentCard
              title={'Profit realized to wallet'}
              value={'-'}
              modal={
                <Text>
                  The cumulative amount of collateral or debt that you have realized as profits to
                  your wallet.
                </Text>
              }
              modalAsTooltip
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
                  However you learn, we’ve got you covered. Watch a video tutorial or read a in
                  depth how to article. Both walk you through setting up your Auto Take Profit
                  automation like a pro.
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
