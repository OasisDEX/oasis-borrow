import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

type AaveMultiplyPositionDataProps = { currentPosition: IPosition; oraclePrice: BigNumber }

export function AaveMultiplyPositionData({
  currentPosition,
  oraclePrice,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()

  const { collateral, debt, category, riskRatio, liquidationPrice } = currentPosition

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral.amount
    .times(oraclePrice)
    .times(category.maxLoanToValue)
    .minus(debt.amount.times(oraclePrice))

  // collateral * usdprice - debt * usdprice
  const netValue = collateral.amount.times(oraclePrice).minus(debt.amount.times(oraclePrice))

  // collateral * multiple
  const totalExposure = collateral.amount.times(riskRatio.multiple)

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`$${formatAmount(
              liquidationPrice.isNaN() ? zero : liquidationPrice.times(oraclePrice),
              'USD',
            )}`}
            footnote={`${t('manage-earn-vault.below-current-price', {
              percentage: formatDecimalAsPercent(one.minus(liquidationPrice)),
            })}`}
          />
          <DetailsSectionContentCard
            title={t('system.loan-to-value')}
            value={formatDecimalAsPercent(riskRatio.loanToValue)}
            footnote={`${t('manage-earn-vault.liquidation-threshold', {
              percentage: formatDecimalAsPercent(category.liquidationThreshold),
            })}`}
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(new BigNumber(0))}
          />
          <DetailsSectionContentCard
            title={t('system.net-value')}
            value={formatAmount(netValue, 'USD')}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatAmount(debt.amount.times(oraclePrice), 'USD')} USDC`}
          />
          <DetailsSectionFooterItem
            title={t('system.total-exposure', { token: collateral.denomination })}
            value={`${formatAmount(totalExposure, 'ETH')} ETH`}
          />
          <DetailsSectionFooterItem
            title={t('system.multiple')}
            value={`${riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x`}
          />
          <DetailsSectionFooterItem
            title={t('system.buying-power')}
            value={`${formatAmount(buyingPower, 'USD')} USDC`}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
