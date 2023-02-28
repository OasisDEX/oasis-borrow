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
  const now = new Date()

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
      {now > earlyWithdrawalPeriod ? (
        <DetailsSectionFooterItem
          title={t('ajna.earn.manage.overview.early-withdrawal-period')}
          value={t('ajna.earn.manage.overview.early-withdrawal-ended', { earlyWithdrawalPeriod: formatted.earlyWithdrawalPeriod })}
        />
      ) : (
        <DetailsSectionFooterItem
          title={t('ajna.earn.manage.overview.early-withdrawal-penalty')}
          value={t('ajna.earn.manage.overview.early-withdrawal-ends-in', {
            earlyWithdrawalPenalty: formatted.earlyWithdrawalPenalty,
            earlyWithdrawalPeriod: formatted.earlyWithdrawalPeriod,
          })}
        />
      )}
    </>
  )
}
