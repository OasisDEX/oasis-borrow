import BigNumber from 'bignumber.js'
import { ethNullAddress } from 'blockchain/networks'
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
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Divider, Flex, Heading, Image, Text } from 'theme-ui'

type AavePartialTakeProfitManageDetailsProps = {
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
  aaveLikePartialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
  netValuePnlCollateralData: OmniNetValuePnlDataReturnType
  netValuePnlDebtData: OmniNetValuePnlDataReturnType
  historyEvents:
    | Partial<AjnaHistoryEvent>[]
    | Partial<AaveLikeHistoryEvent>[]
    | Partial<PositionHistoryEvent>[]
  simpleView?: boolean
}

const reduceHistoryEvents = (events: AavePartialTakeProfitManageDetailsProps['historyEvents']) => {
  const eventsDefault = {
    collateralToken: zero,
    debtToken: zero,
  } as const
  return (
    events
      // example: "AutomationExecuted-DmaAavePartialTakeProfitV2"
      .filter(({ kind }) => kind?.includes('PartialTakeProfit'))
      .filter(({ kind }) => kind?.includes('AutomationExecuted'))
      .reduce((acc, event) => {
        if (!event.withdrawTransfers?.length) {
          return acc
        }
        const newTransfersRealized = { ...acc }
        event.withdrawTransfers?.forEach((transfer) => {
          if (!transfer.amount.isZero() && event.collateralAddress && event.debtAddress) {
            const collateralTokenAddress =
              event.collateralToken === 'WETH'
                ? ethNullAddress.toLocaleLowerCase()
                : event.collateralAddress.toLocaleLowerCase()
            const debtTokenAddress =
              event.debtToken === 'WETH'
                ? ethNullAddress.toLocaleLowerCase()
                : event.debtAddress.toLocaleLowerCase()
            const isCollateralTokenTransfer =
              transfer.token.toLocaleLowerCase() === collateralTokenAddress
            const isDebtTokenTransfer = transfer.token.toLocaleLowerCase() === debtTokenAddress
            if (isCollateralTokenTransfer) {
              newTransfersRealized.collateralToken = newTransfersRealized.collateralToken.plus(
                new BigNumber(transfer.amount),
              )
            }
            if (isDebtTokenTransfer) {
              newTransfersRealized.debtToken = newTransfersRealized.debtToken.plus(
                new BigNumber(transfer.amount),
              )
            }
          }
        })
        return newTransfersRealized
      }, eventsDefault) as Record<'debtToken' | 'collateralToken', BigNumber>
  )
}

export const AavePartialTakeProfitManageDetails = ({
  aaveLikePartialTakeProfitParams,
  aaveLikePartialTakeProfitLambdaData,
  netValuePnlCollateralData,
  netValuePnlDebtData,
  historyEvents,
  simpleView,
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
    partialTakeProfitToken === 'debt' ? realizedProfit.debtToken : realizedProfit.collateralToken,
    partialTakeProfitTokenData.symbol,
  )
  const realizedProfitSecondValue = `${formatAmount(
    partialTakeProfitToken === 'collateral'
      ? realizedProfit.debtToken
      : realizedProfit.collateralToken,
    partialTakeProfitSecondTokenData.symbol,
  )} ${partialTakeProfitSecondTokenData.symbol}`
  const nextTriggerProfit = partialTakeProfitProfits ? partialTakeProfitProfits[0] : undefined
  const primaryPnlValue = useMemo(() => {
    if (netValuePnlCollateralData.pnl?.pnlToken === partialTakeProfitTokenData.symbol) {
      return netValuePnlCollateralData.pnl.inToken || zero
    }
    if (netValuePnlDebtData.pnl?.pnlToken === partialTakeProfitTokenData.symbol) {
      return netValuePnlDebtData.pnl.inToken || zero
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
      return netValuePnlCollateralData.pnl.inToken || zero
    }
    if (netValuePnlDebtData.pnl?.pnlToken === partialTakeProfitSecondTokenData.symbol) {
      return netValuePnlDebtData.pnl.inToken || zero
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
    const priceChangeOffset = new BigNumber(0.001)
    if (
      (!partialTakeProfitFirstProfit ||
        !nextTriggerProfit ||
        partialTakeProfitFirstProfit.triggerPrice
          .minus(nextTriggerProfit.triggerPrice)
          .abs()
          .lt(priceChangeOffset)) &&
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
                <>
                  <Heading variant="header4">Next Dynamic Trigger Price</Heading>
                  <Text as="p" variant="paragraph3">
                    The next price in which you will realize profits to your wallet. It is dynamic
                    because position changes made prior to it triggering may make the trigger price
                    increase.
                  </Text>
                </>
              }
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
                <>
                  <Heading variant="header4">Est. to receive next trigger</Heading>
                  <Text as="p" variant="paragraph3">
                    The amount of collateral or debt that will be withdrawn to your wallet upon
                    trigger.
                  </Text>
                </>
              }
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
                <>
                  <Heading variant="header4">Current profit/loss</Heading>
                  <Text as="p" variant="paragraph3">
                    The profit or loss of your position, denominated in collateral, including
                    realized profits to wallet. Specifically, P&L = ((Net value + Cumulative
                    withdrawals) - Cumulative deposits) / Cumulative deposits.
                  </Text>
                </>
              }
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
                <>
                  <Heading variant="header4">Profit realized to wallet</Heading>
                  <Text as="p" variant="paragraph3">
                    The cumulative amount of collateral or debt that you have realized as profits to
                    your wallet.
                  </Text>
                </>
              }
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
                    <AppLink
                      href={EXTERNAL_LINKS.HOW_TO_SET_UP_AUTO_TAKE_PROFIT_VIDEO}
                      sx={{ mr: 5 }}
                    >
                      <WithArrow sx={{ color: 'interactive100' }}>Watch tutorial</WithArrow>
                    </AppLink>
                    <AppLink
                      href={EXTERNAL_LINKS.BLOG.HOW_TO_SET_UP_AUTO_TAKE_PROFIT}
                      sx={{ mr: 5 }}
                    >
                      <WithArrow sx={{ color: 'interactive100' }}>Read article</WithArrow>
                    </AppLink>
                  </Flex>
                </Box>
              </Box>
            )}
          </>
        }
      />
    </>
  )
}
