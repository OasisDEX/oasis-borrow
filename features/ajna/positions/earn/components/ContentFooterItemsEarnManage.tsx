import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnOpenProps {
  quoteToken: string
  availableToWithdraw: BigNumber
  projectedAnnualReward: BigNumber
  totalAjnaRewards: BigNumber
  afterAvailableToWithdraw?: BigNumber
}

export function ContentFooterItemsEarnManage({
  quoteToken,
  availableToWithdraw,
  projectedAnnualReward,
  totalAjnaRewards,
  afterAvailableToWithdraw,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    availableToWithdraw: `${formatCryptoBalance(availableToWithdraw)} ${quoteToken}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw && `${formatCryptoBalance(afterAvailableToWithdraw)} ${quoteToken}`,
    projectedAnnualReward: `${formatDecimalAsPercent(projectedAnnualReward)}`,
    totalAjnaRewards: `${formatCryptoBalance(totalAjnaRewards)} AJNA`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.available-to-withdraw')}
        value={formatted.availableToWithdraw}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.earn.manage.overview.projected-annual-reward')}
        value={formatted.projectedAnnualReward}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.earn.manage.overview.total-ajna-rewards')}
        value={formatted.totalAjnaRewards}
      />
    </>
  )
}
