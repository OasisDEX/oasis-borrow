import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import type { AaveLikePartialTakeProfitParamsResult } from 'features/aave/open/helpers/get-aave-like-partial-take-profit-params'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const AavePartialTakeProfitManageDetails = ({
  aaveLikePartialTakeProfitParams,
}: {
  aaveLikePartialTakeProfitParams: AaveLikePartialTakeProfitParamsResult
}) => {
  const { t } = useTranslation()

  const {
    partialTakeProfitTokenData,
    partialTakeProfitSecondTokenData,
    priceFormat,
    liquidationPrice,
    priceDenominationToken,
    currentLtv,
    currentMultiple,
    startingTakeProfitPrice,
    triggerLtv,
  } = aaveLikePartialTakeProfitParams

  return (
    <DetailsSection
      title={t('system.partial-take-profit')}
      badge={true}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard
            title={'New Dynamic Trigger Price'}
            value={'-'}
            unit={priceFormat}
            change={[`${formatCryptoBalance(startingTakeProfitPrice)} ${priceFormat} after`]}
            changeVariant="positive"
            footnote={[`TriggerLTV: ${triggerLtv}%`]}
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
      }
    />
  )
}
