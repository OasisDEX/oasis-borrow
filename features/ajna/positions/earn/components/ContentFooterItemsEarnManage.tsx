import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { Skeleton } from 'components/Skeleton'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { useAjnaRewards } from 'features/ajna/rewards/useAjnaRewards'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnOpenProps {
  quoteToken: string
  availableToWithdraw: BigNumber
  projectedAnnualReward: BigNumber
  afterAvailableToWithdraw?: BigNumber
}

export function ContentFooterItemsEarnManage({
  quoteToken,
  availableToWithdraw,
  afterAvailableToWithdraw,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()
  const userAjnaRewards = useAjnaRewards()

  const formatted = {
    availableToWithdraw: `${formatCryptoBalance(availableToWithdraw)} ${quoteToken}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw && `${formatCryptoBalance(afterAvailableToWithdraw)} ${quoteToken}`,
    // projectedAnnualReward: `${formatDecimalAsPercent(projectedAnnualReward)}`,
    // TODO: replace with value when available
    projectedAnnualReward: 'n/a',
    totalAjnaRewards: userAjnaRewards.isLoading ? (
      <Skeleton width="64px" sx={{ mt: 1 }} />
    ) : (
      `${formatCryptoBalance(userAjnaRewards.rewards.tokens)} AJNA`
    ),
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.available-to-withdraw')}
        value={formatted.availableToWithdraw}
        modal={
          <AjnaDetailsSectionContentSimpleModal
            title={t('ajna.position-page.earn.manage.overview.available-to-withdraw')}
            description={t(
              'ajna.position-page.earn.manage.overview.available-to-withdraw-modal-desc',
            )}
            value={formatted.availableToWithdraw}
          />
        }
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.earn.manage.overview.projected-annual-reward')}
        value={formatted.projectedAnnualReward}
        modal={
          <AjnaDetailsSectionContentSimpleModal
            title={t('ajna.position-page.earn.manage.overview.projected-annual-rewards')}
            description={t(
              'ajna.position-page.earn.manage.overview.projected-annual-rewards-modal-desc',
            )}
            value={formatted.projectedAnnualReward}
          />
        }
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.earn.manage.overview.total-ajna-rewards')}
        value={formatted.totalAjnaRewards}
        modal={
          <AjnaDetailsSectionContentSimpleModal
            title={t('ajna.position-page.earn.manage.overview.total-ajna-rewards')}
            description={t('ajna.position-page.earn.manage.overview.total-ajna-rewards-modal-desc')}
            value={`${formatted.totalAjnaRewards} ${t('earned')}`}
          />
        }
      />
    </>
  )
}
