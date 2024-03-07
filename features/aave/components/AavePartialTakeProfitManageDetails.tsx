import type BigNumber from 'bignumber.js'
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
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Divider, Flex, Image, Text } from 'theme-ui'

type AavePartialTakeProfitManageDetailsProps = {
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  netValuePnlCollateralData: OmniNetValuePnlDataReturnType
  netValuePnlDebtData: OmniNetValuePnlDataReturnType
  historyEvents:
    | Partial<AjnaHistoryEvent>[]
    | Partial<AaveLikeHistoryEvent>[]
    | Partial<PositionHistoryEvent>[]
}

const reduceHistoryEvents = (events: AavePartialTakeProfitManageDetailsProps['historyEvents']) => {
  return (
    events
      // example: "AutomationExecuted-DmaAavePartialTakeProfitV2"
      .filter(({ kind }) => kind?.includes('PartialTakeProfit'))
      .filter(({ kind }) => kind?.includes('AutomationExecuted'))
      .reduce(
        (acc, event) => {
          return {
            debtRealized: (acc.debtRealized || zero).plus(event.debtDelta?.abs() || zero),
            collateralRealized: (acc.collateralRealized || zero).plus(
              event.collateralDelta?.abs() || zero,
            ),
          }
        },
        {
          debtRealized: zero,
          collateralRealized: zero,
        },
      ) as {
      debtRealized: BigNumber
      collateralRealized: BigNumber
    }
  )
}

export const AavePartialTakeProfitManageDetails = ({
  aaveLikePartialTakeProfitParams,
  aaveLikePartialTakeProfitLambdaData,
  netValuePnlCollateralData,
  netValuePnlDebtData,
  historyEvents,
}: AavePartialTakeProfitManageDetailsProps) => {
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
    triggerLtv,
    partialTakeProfitProfits,
    partialTakeProfitFirstProfit,
  } = aaveLikePartialTakeProfitParams
  const { triggerLtv: lambdaTriggerLtv } = aaveLikePartialTakeProfitLambdaData
  const hasLambdaTriggerLtv = !!lambdaTriggerLtv

  const realizedProfit = useMemo(() => {
    return reduceHistoryEvents(historyEvents)
  }, [historyEvents])

  const realizedProfitValue = formatAmount(
    partialTakeProfitToken === 'debt'
      ? realizedProfit.debtRealized
      : realizedProfit.collateralRealized,
    partialTakeProfitTokenData.symbol,
  )
  const realizedProfitSecondValue = `${formatAmount(
    partialTakeProfitToken === 'collateral'
      ? realizedProfit.debtRealized
      : realizedProfit.collateralRealized,
    partialTakeProfitSecondTokenData.symbol,
  )} ${partialTakeProfitSecondTokenData.symbol}`
  const nextTriggerProfit = partialTakeProfitProfits ? partialTakeProfitProfits[0] : undefined
  const primaryPnlValue = useMemo(() => {
    if (netValuePnlCollateralData.pnl?.pnlToken === partialTakeProfitTokenData.symbol) {
      return netValuePnlCollateralData.pnl.inToken
    }
    if (netValuePnlDebtData.pnl?.pnlToken === partialTakeProfitTokenData.symbol) {
      return netValuePnlDebtData.pnl.inToken
    }
    return zero
  }, [
    netValuePnlCollateralData.pnl?.inToken,
    netValuePnlCollateralData.pnl?.pnlToken,
    netValuePnlDebtData.pnl?.inToken,
    netValuePnlDebtData.pnl?.pnlToken,
    partialTakeProfitTokenData.symbol,
  ])
  const secondaryPnlValue = useMemo(() => {
    if (netValuePnlCollateralData.pnl?.pnlToken === partialTakeProfitSecondTokenData.symbol) {
      return netValuePnlCollateralData.pnl.inToken
    }
    if (netValuePnlDebtData.pnl?.pnlToken === partialTakeProfitSecondTokenData.symbol) {
      return netValuePnlDebtData.pnl.inToken
    }
    return zero
  }, [
    netValuePnlCollateralData.pnl?.inToken,
    netValuePnlCollateralData.pnl?.pnlToken,
    netValuePnlDebtData.pnl?.inToken,
    netValuePnlDebtData.pnl?.pnlToken,
    partialTakeProfitSecondTokenData.symbol,
  ])

  const nextDynamicTriggerPriceValue = useMemo(() => {
    return partialTakeProfitFirstProfit && hasLambdaTriggerLtv
      ? formatCryptoBalance(partialTakeProfitFirstProfit.triggerPrice)
      : '-'
  }, [partialTakeProfitFirstProfit, hasLambdaTriggerLtv])
  const nextDynamicTriggerPriceValueChange = useMemo(() => {
    if (
      (!partialTakeProfitFirstProfit ||
        !nextTriggerProfit ||
        partialTakeProfitFirstProfit.triggerPrice.eq(nextTriggerProfit.triggerPrice)) &&
      hasLambdaTriggerLtv
    ) {
      return undefined
    }
    return nextTriggerProfit
      ? [`${formatCryptoBalance(nextTriggerProfit.triggerPrice)} ${priceFormat}`]
      : []
  }, [hasLambdaTriggerLtv, nextTriggerProfit, partialTakeProfitFirstProfit, priceFormat])

  const realizedProfitInSelectedToken = useMemo(() => {
    return partialTakeProfitToken === 'collateral'
      ? partialTakeProfitFirstProfit?.realizedProfitInCollateral
      : partialTakeProfitFirstProfit?.realizedProfitInDebt
  }, [
    partialTakeProfitFirstProfit?.realizedProfitInCollateral,
    partialTakeProfitFirstProfit?.realizedProfitInDebt,
    partialTakeProfitToken,
  ])
  const estimatedToReceiveNextTriggerValue = useMemo(() => {
    if (!partialTakeProfitFirstProfit || !realizedProfitInSelectedToken || !hasLambdaTriggerLtv) {
      return '-'
    }
    return formatCryptoBalance(realizedProfitInSelectedToken.balance)
  }, [partialTakeProfitFirstProfit, realizedProfitInSelectedToken, hasLambdaTriggerLtv])

  const estimatedToReceiveNextTriggerValueChange = useMemo(() => {
    if (!partialTakeProfitFirstProfit || !nextTriggerProfit || !realizedProfitInSelectedToken) {
      return undefined
    }
    const realizedProfitChangeInSelectedToken =
      partialTakeProfitToken === 'collateral'
        ? nextTriggerProfit.realizedProfitInCollateral
        : nextTriggerProfit.realizedProfitInDebt

    if (
      realizedProfitChangeInSelectedToken.balance.eq(realizedProfitInSelectedToken.balance) &&
      hasLambdaTriggerLtv
    ) {
      return undefined
    }

    return [
      `${formatCryptoBalance(realizedProfitChangeInSelectedToken.balance)} ${
        partialTakeProfitTokenData.symbol
      }`,
    ]
  }, [
    nextTriggerProfit,
    partialTakeProfitFirstProfit,
    partialTakeProfitToken,
    partialTakeProfitTokenData.symbol,
    realizedProfitInSelectedToken,
    hasLambdaTriggerLtv,
  ])
  return (
    <>
      <DetailsSection
        title={t('system.partial-take-profit')}
        badge={hasLambdaTriggerLtv}
        content={
          <DetailsSectionContentCardWrapper>
            <OmniContentCard
              title={'Next Dynamic Trigger Price'}
              value={nextDynamicTriggerPriceValue}
              unit={priceFormat}
              modal={
                <Text>
                  The next price in which you will realize profits to your wallet. It is dynamic
                  because position changes made prior to it triggering may make the trigger price
                  increase.
                </Text>
              }
              modalAsTooltip
              isLoading={!partialTakeProfitFirstProfit || !nextTriggerProfit}
              isValueLoading={!partialTakeProfitFirstProfit}
              change={nextDynamicTriggerPriceValueChange}
              changeVariant={
                partialTakeProfitFirstProfit && nextTriggerProfit
                  ? nextTriggerProfit.triggerPrice.gte(partialTakeProfitFirstProfit.triggerPrice)
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
              value={estimatedToReceiveNextTriggerValue}
              isLoading={
                !partialTakeProfitFirstProfit ||
                !nextTriggerProfit ||
                !realizedProfitInSelectedToken
              }
              isValueLoading={!partialTakeProfitFirstProfit || !realizedProfitInSelectedToken}
              unit={partialTakeProfitTokenData.symbol}
              change={estimatedToReceiveNextTriggerValueChange}
              changeVariant="positive"
              footnote={
                partialTakeProfitFirstProfit && hasLambdaTriggerLtv
                  ? [
                      `${formatAmount(
                        partialTakeProfitToken === 'collateral' // yes, this is the other way around
                          ? partialTakeProfitFirstProfit.realizedProfitInDebt.balance
                          : partialTakeProfitFirstProfit.realizedProfitInCollateral.balance,
                        partialTakeProfitSecondTokenData.symbol,
                      )} ${partialTakeProfitSecondTokenData.symbol}`,
                    ]
                  : []
              }
            />
            <OmniContentCard
              title={'Current profit/loss'}
              value={
                hasLambdaTriggerLtv
                  ? formatAmount(primaryPnlValue, partialTakeProfitTokenData.symbol)
                  : '-'
              }
              modal={
                <Text>
                  The profit or loss of your position, denominated in collateral, including realized
                  profits to wallet. Specifically, P&L = ((Net value + Cumulative withdrawals) -
                  Cumulative deposits) / Cumulative deposits.
                </Text>
              }
              modalAsTooltip
              unit={partialTakeProfitTokenData.symbol}
              footnote={
                hasLambdaTriggerLtv
                  ? [
                      `${formatAmount(
                        secondaryPnlValue,
                        partialTakeProfitSecondTokenData.symbol,
                      )} ${partialTakeProfitSecondTokenData.symbol}`,
                    ]
                  : []
              }
            />
            <OmniContentCard
              title={'Profit realized to wallet'}
              value={hasLambdaTriggerLtv ? realizedProfitValue : '-'}
              modal={
                <Text>
                  The cumulative amount of collateral or debt that you have realized as profits to
                  your wallet.
                </Text>
              }
              modalAsTooltip
              unit={partialTakeProfitTokenData.symbol}
              footnote={realizedProfit && hasLambdaTriggerLtv ? [realizedProfitSecondValue] : []}
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
