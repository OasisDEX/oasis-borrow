import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { timeAgo } from 'utils/timeAgo'

interface ContentFooterItemsEarnOpenProps {
  collateralToken: string
  availableToWithdraw: BigNumber
  afterAvailableToWithdraw?: BigNumber
  earlyWithdrawalPenalty: BigNumber
  earlyWithdrawalPeriod: Date
}

export function ContentFooterItemsEarnManage({
  collateralToken,
  availableToWithdraw,
  afterAvailableToWithdraw,
  earlyWithdrawalPeriod,
  earlyWithdrawalPenalty,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    availableToWithdraw: `${formatAmount(availableToWithdraw, collateralToken)} ${collateralToken}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw &&
      `${formatAmount(afterAvailableToWithdraw, collateralToken)} ${collateralToken}`,
    earlyWithdrawalPeriod: timeAgo({ to: earlyWithdrawalPeriod }),
    earlyWithdrawalPenalty: `${formatAmount(
      earlyWithdrawalPenalty,
      collateralToken,
    )} ${collateralToken}`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.available-to-withdraw')}
        value={formatted.availableToWithdraw}
      />
      <DetailsSectionFooterItem
        title={t('ajna.earn.manage.overview.early-withdrawal-period')}
        value={formatted.earlyWithdrawalPeriod}
      />
      <DetailsSectionFooterItem
        title={t('ajna.earn.manage.overview.early-withdrawal-penalty')}
        value={formatted.earlyWithdrawalPenalty}
      />
    </>
  )
}
