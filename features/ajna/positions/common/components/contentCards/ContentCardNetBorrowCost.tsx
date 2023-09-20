import { Icon } from '@makerdao/dai-ui-icons'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { isPoolWithRewards } from 'features/ajna/positions/common/helpers/isPoolWithRewards'
import { useAjnaRewards } from 'features/ajna/rewards/useAjnaRewards'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface ContentCardNetBorrowCostProps {
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  owner: string
  netBorrowCost: BigNumber
  afterNetBorrowCost?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardNetBorrowCost({
  isLoading,
  collateralToken,
  quoteToken,
  owner,
  netBorrowCost,
  afterNetBorrowCost,
  changeVariant = 'positive',
}: ContentCardNetBorrowCostProps) {
  const { t } = useTranslation()
  const userAjnaRewards = useAjnaRewards(owner)

  const formatted = {
    netBorrowCost: formatDecimalAsPercent(netBorrowCost),
    afterNetBorrowCost: afterNetBorrowCost && formatDecimalAsPercent(afterNetBorrowCost),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.multiply.common.overview.net-borrow-cost'),
    value: (
      <>
        {isPoolWithRewards({ collateralToken, quoteToken }) && (
          <StatefulTooltip
            tooltip={
              <>
                <Text as="p">
                  <strong>{t('ajna.position-page.borrow.common.footer.earned-ajna-tokens')}</strong>
                  : {t('ajna.position-page.borrow.common.footer.earned-ajna-tokens-tooltip-desc')}
                </Text>
                <Text as="p" sx={{ mt: 2, fontWeight: 'semiBold' }}>
                  {userAjnaRewards.isLoading ? (
                    <Skeleton width="64px" />
                  ) : (
                    `${formatCryptoBalance(userAjnaRewards.rewards.tokens)} AJNA ${t('earned')}`
                  )}
                </Text>
              </>
            }
            containerSx={{ position: 'relative', top: '2px', display: 'inline-block', mr: 1 }}
            tooltipSx={{
              width: '300px',
              fontSize: 1,
              whiteSpace: 'initial',
              textAlign: 'left',
              border: 'none',
              borderRadius: 'medium',
              boxShadow: 'buttonMenu',
              fontWeight: 'regular',
              lineHeight: 'body',
            }}
          >
            <Icon size={24} name="ajnaSparks" color="interactive100" />
          </StatefulTooltip>
        )}
        {formatted.netBorrowCost}
      </>
    ),
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.multiply.common.overview.net-borrow-cost')}
        description={t('ajna.position-page.multiply.common.overview.net-borrow-cost-modal-desc')}
        value={formatted.netBorrowCost}
      />
    ),
    change: {
      isLoading,
      value:
        afterNetBorrowCost && `${formatted.afterNetBorrowCost} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
