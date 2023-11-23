import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Text } from 'theme-ui'

interface OmniContentCardTotalEarningsProps extends OmniContentCardCommonProps {
  afterTotalEarnings?: BigNumber
  netPnL: BigNumber
  quoteToken: string
  totalEarnings: BigNumber
  totalEarningsWithoutFees: BigNumber
}

export function OmniContentCardTotalEarnings({
  modalTheme,
  netPnL,
  quoteToken,
  totalEarnings,
  totalEarningsWithoutFees,
}: OmniContentCardTotalEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    totalEarnings: formatCryptoBalance(totalEarnings),
    totalEarningsWithoutFees: formatCryptoBalance(totalEarningsWithoutFees),
    netPnL: formatDecimalAsPercent(netPnL),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.total-earnings'),
    value: formatted.totalEarningsWithoutFees,
    unit: quoteToken,
    footnote: t('ajna.position-page.earn.manage.overview.net-pnl', {
      netPnL: formatted.netPnL,
    }),
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.total-earnings')}
        description={t('ajna.position-page.earn.manage.overview.total-earnings-modal-desc', {
          quoteToken,
        })}
        theme={modalTheme}
      >
        <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
          {`${formatted.totalEarningsWithoutFees} ${quoteToken}`}
        </Card>
        <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
          {t('ajna.position-page.earn.manage.overview.total-earnings-modal-sub-desc')}
        </Text>
        <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
          {`${formatted.totalEarnings} ${quoteToken}`}
        </Card>
      </DetailsSectionContentSimpleModal>
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
