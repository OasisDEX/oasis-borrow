import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { Icon } from 'components/Icon'
import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { isPoolWithRewards } from 'features/omni-kit/protocols/ajna/helpers'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { sparks } from 'theme/icons'
import { Text } from 'theme-ui'

interface AjnaContentCardNetBorrowCostProps extends OmniContentCardCommonProps {
  afterNetBorrowCost?: BigNumber
  collateralToken: string
  netBorrowCost: BigNumber
  owner: string
  quoteToken: string
}

export function AjnaContentCardNetBorrowCost({
  afterNetBorrowCost,
  changeVariant,
  collateralToken,
  isLoading,
  modalTheme,
  netBorrowCost,
  owner,
  quoteToken,
}: AjnaContentCardNetBorrowCostProps) {
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
            <Icon size={24} icon={sparks} color="interactive100" />
          </StatefulTooltip>
        )}
        {formatted.netBorrowCost}
      </>
    ),
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.multiply.common.overview.net-borrow-cost')}
        description={t('ajna.position-page.multiply.common.overview.net-borrow-cost-modal-desc')}
        value={formatted.netBorrowCost}
        theme={modalTheme}
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
