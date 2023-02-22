import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { timeAgo } from 'utils/timeAgo'

interface ContentFooterItemsEarnOpenProps {
  quoteToken: string
  availableToWithdraw: BigNumber
  afterAvailableToWithdraw?: BigNumber
  earlyWithdrawalPenalty: BigNumber
  earlyWithdrawalPeriod: Date
}

export function ContentFooterItemsEarnManage({
  quoteToken,
  availableToWithdraw,
  afterAvailableToWithdraw,
  earlyWithdrawalPeriod,
  earlyWithdrawalPenalty,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    availableToWithdraw: `${formatAmount(availableToWithdraw, quoteToken)} ${quoteToken}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw &&
      `${formatAmount(afterAvailableToWithdraw, quoteToken)} ${quoteToken}`,
    earlyWithdrawalPeriod: timeAgo({ to: earlyWithdrawalPeriod }),
    earlyWithdrawalPenalty: `${formatAmount(earlyWithdrawalPenalty, quoteToken)} ${quoteToken}`,
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
