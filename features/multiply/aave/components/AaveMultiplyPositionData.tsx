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

type AaveMultiplyPositionDataProps = {
  currentPosition: IPosition
  newPosition?: IPosition
  collateralPrice: BigNumber
}

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

const NaNIsZero = (number: BigNumber) => (number.isNaN() ? zero : number)

export function AaveMultiplyPositionData({
  currentPosition,
  newPosition,
  collateralPrice,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()

  const { collateral, debt, category, riskRatio } = currentPosition

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral.amount
    .times(collateralPrice)
    .times(category.maxLoanToValue)
    .minus(debt.amount.times(collateralPrice))

  const newBuyingPower =
    newPosition &&
    newPosition.collateral.amount
      .times(collateralPrice)
      .times(newPosition.category.maxLoanToValue)
      .minus(newPosition.debt.amount.times(collateralPrice))

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price
  const netValue = collateral.amount
    .times(collateralPrice)
    .minus(debt.amount.times(collateralPrice))
  const newNetValue =
    newPosition &&
    newPosition.collateral.amount
      .times(collateralPrice)
      .minus(newPosition.debt.amount.times(collateralPrice))

  // collateral * multiple
  const totalExposure = collateral.amount.times(riskRatio.multiple)
  const newTotalExposure =
    newPosition && newPosition.collateral.amount.times(newPosition.riskRatio.multiple)

  const liquidationPrice = NaNIsZero(currentPosition.liquidationPrice)
  const newLiquidationPrice =
    newPosition?.liquidationPrice && NaNIsZero(newPosition.liquidationPrice)

  const liquidationPriceUSD = liquidationPrice.times(collateralPrice)
  const newLiquidationPriceUSD = newLiquidationPrice && newLiquidationPrice.times(collateralPrice)

  const positionDebt = debt.amount.times(collateralPrice)
  const newPositionDebt = newPosition && newPosition.debt.amount.times(collateralPrice)

  const multiple = riskRatio.multiple
  const newMultiple = newPosition && newPosition.riskRatio.multiple

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`$${formatAmount(liquidationPriceUSD, 'USD')}`}
            footnote={`${t('manage-earn-vault.below-current-price', {
              percentage: formatDecimalAsPercent(one.minus(liquidationPrice)),
            })}`}
            change={
              newLiquidationPriceUSD && {
                variant: newLiquidationPriceUSD.gt(liquidationPriceUSD) ? 'positive' : 'negative',
                value: `$${formatAmount(newLiquidationPriceUSD, 'USD')} ${t('after')}`,
              }
            }
          />
          <DetailsSectionContentCard
            title={t('system.loan-to-value')}
            value={formatDecimalAsPercent(riskRatio.loanToValue)}
            footnote={`${t('manage-earn-vault.liquidation-threshold', {
              percentage: formatDecimalAsPercent(category.liquidationThreshold),
            })}`}
            customBackground={
              !newPosition?.riskRatio
                ? getLTVRatioColor(
                    category.liquidationThreshold.minus(riskRatio.loanToValue).times(100),
                  )
                : 'transparent'
            }
            change={
              newPosition?.riskRatio && {
                variant: newPosition.riskRatio.loanToValue.gt(riskRatio.loanToValue)
                  ? 'positive'
                  : 'negative',
                value: `${formatDecimalAsPercent(category.liquidationThreshold)} ${t('after')}`,
              }
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(new BigNumber(0))}
            change={
              newNetValue && {
                variant: 'positive',
                value: '????',
              }
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-value')}
            value={formatAmount(netValue, 'USD')}
            footnote={`${t('system.pnl-usd', {
              value: formatAmount(collateral.amount.minus(debt.amount), 'USD'),
            })}`}
            change={
              newNetValue && {
                variant: newNetValue.gt(netValue) ? 'positive' : 'negative',
                value: `${formatAmount(newNetValue, 'USD')} ${t('after')}`,
              }
            }
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatAmount(positionDebt, 'USD')} USDC`}
            change={
              newPositionDebt && {
                variant: newPositionDebt.gt(positionDebt) ? 'positive' : 'negative',
                value: `${formatAmount(newPositionDebt, 'USD')} USDC ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.total-exposure', { token: collateral.denomination })}
            value={`${formatAmount(totalExposure, 'ETH')} ETH`}
            change={
              newTotalExposure && {
                variant: newTotalExposure.gt(totalExposure) ? 'positive' : 'negative',
                value: `${formatAmount(newTotalExposure, 'ETH')} ETH ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.multiple')}
            value={`${multiple.toFormat(1, BigNumber.ROUND_DOWN)}x`}
            change={
              newMultiple && {
                variant: newMultiple.gt(multiple) ? 'positive' : 'negative',
                value: `${newMultiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.buying-power')}
            value={`${formatAmount(buyingPower, 'USD')} USDC`}
            change={
              newBuyingPower && {
                variant: newBuyingPower.gt(buyingPower) ? 'positive' : 'negative',
                value: `${formatAmount(newBuyingPower, 'USD')} USDC ${t('after')}`,
              }
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
