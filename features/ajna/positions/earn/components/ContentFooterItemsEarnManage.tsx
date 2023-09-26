import { negativeToZero } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { Skeleton } from 'components/Skeleton'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { useAjnaRewards } from 'features/ajna/rewards/useAjnaRewards'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnOpenProps {
  collateralToken: string
  quoteToken: string
  owner: string
  availableToWithdraw: BigNumber
  projectedAnnualReward: BigNumber
  afterAvailableToWithdraw?: BigNumber
  isOracless: boolean
  isLoading?: boolean
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsEarnManage({
  collateralToken,
  quoteToken,
  owner,
  availableToWithdraw,
  afterAvailableToWithdraw,
  isOracless,
  isLoading,
  changeVariant = 'positive',
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()
  const userAjnaRewards = useAjnaRewards(owner)

  const formatted = {
    availableToWithdraw: `${formatCryptoBalance(
      negativeToZero(availableToWithdraw),
    )} ${quoteToken}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw &&
      `${formatCryptoBalance(negativeToZero(afterAvailableToWithdraw))} ${quoteToken}`,
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
        change={{
          isLoading,
          value: formatted.afterAvailableToWithdraw,
          variant: changeVariant,
        }}
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
      {isPoolWithRewards({ collateralToken, quoteToken }) && !isOracless && (
        <>
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
                description={t(
                  'ajna.position-page.earn.manage.overview.total-ajna-rewards-modal-desc',
                )}
                value={`${formatted.totalAjnaRewards} ${t('earned')}`}
              />
            }
          />
        </>
      )}
    </>
  )
}
