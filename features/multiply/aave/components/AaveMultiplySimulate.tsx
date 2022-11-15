import { Position } from '@oasisdex/oasis-actions'
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
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

const mockPosition = new Position(
  { amount: new BigNumber(145.984044112720945639) },
  {
    amount: new BigNumber(216.472358366915378115),
    denomination: 'ETH',
  },
  new BigNumber(2100),
  {
    dustLimit: new BigNumber(0),
    maxLoanToValue: new BigNumber(0.72),
    liquidationThreshold: new BigNumber(0.72),
  },
)

export function AaveMultiplySimulate() {
  const { t } = useTranslation()
  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`$${formatAmount(
              mockPosition.liquidationPrice.times(new BigNumber(2100)),
              'USD',
            )}`}
          />
          <DetailsSectionContentCard
            title={t('system.loan-to-value')}
            value={formatPercent(mockPosition.category.maxLoanToValue.times(100), { precision: 2 })}
          />
          <DetailsSectionContentCard
            title={t('system.buying-power')}
            value={`$${formatAmount(new BigNumber(42000.2), 'USD')}`}
            unit="USDC"
          />
          <DetailsSectionContentCard
            title={t('system.net-value')}
            value={formatAmount(new BigNumber(1903222.3), 'USD')}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatAmount(new BigNumber(103203.2), 'USD')} USDC`}
          />
          <DetailsSectionFooterItem
            title={t('system.total-exposure', { token: mockPosition.collateral.denomination })}
            value={`${formatAmount(new BigNumber(1731.99), 'ETH')} ETH`}
          />
          <DetailsSectionFooterItem
            title={t('system.multiple')}
            value={`${new BigNumber(2.2).toFormat(1, BigNumber.ROUND_DOWN)}x ${t(
              'system.multiple',
            ).toLocaleLowerCase()}`}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
