import { negativeToZero } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { Skeleton } from 'components/Skeleton'
import { isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import { useAjnaRewards } from 'features/omni-kit/protocols/ajna/hooks'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaContentFooterEarnManageProps {
  afterAvailableToWithdraw?: BigNumber
  availableToWithdraw: BigNumber
  changeVariant?: ChangeVariantType
  collateralToken: string
  isLoading?: boolean
  isOracless: boolean
  owner: string
  projectedAnnualReward: BigNumber
  quoteToken: string
}

export function AjnaContentFooterEarnManage({
  afterAvailableToWithdraw,
  availableToWithdraw,
  changeVariant,
  collateralToken,
  isLoading,
  isOracless,
  owner,
  quoteToken,
}: AjnaContentFooterEarnManageProps) {
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
          <DetailsSectionContentSimpleModal
            title={t('ajna.position-page.earn.manage.overview.available-to-withdraw')}
            description={t(
              'ajna.position-page.earn.manage.overview.available-to-withdraw-modal-desc',
            )}
            value={formatted.availableToWithdraw}
            theme={ajnaExtensionTheme}
          />
        }
      />
      {isPoolWithRewards({ collateralToken, quoteToken }) && !isOracless && (
        <>
          <DetailsSectionFooterItem
            title={t('ajna.position-page.earn.manage.overview.projected-annual-reward')}
            value={formatted.projectedAnnualReward}
            modal={
              <DetailsSectionContentSimpleModal
                title={t('ajna.position-page.earn.manage.overview.projected-annual-rewards')}
                description={t(
                  'ajna.position-page.earn.manage.overview.projected-annual-rewards-modal-desc',
                )}
                value={formatted.projectedAnnualReward}
                theme={ajnaExtensionTheme}
              />
            }
          />
          <DetailsSectionFooterItem
            title={t('ajna.position-page.earn.manage.overview.total-ajna-rewards')}
            value={formatted.totalAjnaRewards}
            modal={
              <DetailsSectionContentSimpleModal
                title={t('ajna.position-page.earn.manage.overview.total-ajna-rewards')}
                description={t(
                  'ajna.position-page.earn.manage.overview.total-ajna-rewards-modal-desc',
                )}
                value={`${formatted.totalAjnaRewards} ${t('earned')}`}
                theme={ajnaExtensionTheme}
              />
            }
          />
        </>
      )}
    </>
  )
}
