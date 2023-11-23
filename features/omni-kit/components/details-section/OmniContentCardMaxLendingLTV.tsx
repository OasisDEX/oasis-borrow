import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniContentCardMaxLendingLTVProps extends OmniContentCardCommonProps {
  afterMaxLendingPercentage?: BigNumber
  collateralToken: string
  maxLendingPercentage: BigNumber
  quoteToken: string
}

export function OmniContentCardMaxLendingLTV({
  afterMaxLendingPercentage,
  changeVariant,
  collateralToken,
  isLoading,
  maxLendingPercentage,
  modalTheme,
  quoteToken,
}: OmniContentCardMaxLendingLTVProps) {
  const { t } = useTranslation()

  const formatted = {
    maxLendingPercentage: formatDecimalAsPercent(maxLendingPercentage),
    afterMaxLendingPercentage:
      afterMaxLendingPercentage && formatDecimalAsPercent(afterMaxLendingPercentage),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.max-lending-ltv'),
    value: formatted.maxLendingPercentage,
    change: {
      isLoading,
      value:
        afterMaxLendingPercentage &&
        `${formatted.afterMaxLendingPercentage} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.max-lending-ltv')}
        description={t('ajna.position-page.earn.manage.overview.max-lending-ltv-modal-desc', {
          quoteToken,
          collateralToken,
        })}
        value={formatted.maxLendingPercentage}
        theme={modalTheme}
      />
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
