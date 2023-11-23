import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniContentCardCollateralLockedProps extends OmniContentCardCommonProps {
  afterCollateralLocked?: BigNumber
  collateralLocked: BigNumber
  collateralLockedUSD?: BigNumber
  collateralToken: string
}

export function OmniContentCardCollateralLocked({
  afterCollateralLocked,
  changeVariant,
  collateralLocked,
  collateralLockedUSD,
  collateralToken,
  isLoading,
  modalTheme,
}: OmniContentCardCollateralLockedProps) {
  const { t } = useTranslation()

  const formatted = {
    collateralLocked: formatCryptoBalance(collateralLocked),
    afterCollateralLocked:
      afterCollateralLocked && `${formatCryptoBalance(afterCollateralLocked)} ${collateralToken}`,
    collateralLockedUSD: collateralLockedUSD && `$${formatAmount(collateralLockedUSD, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.collateral-locked'),
    value: formatted.collateralLocked,
    unit: collateralToken,
    change: {
      isLoading,
      value:
        afterCollateralLocked &&
        `${formatted.afterCollateralLocked} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.collateral-locked')}
        description={t('ajna.position-page.borrow.common.overview.collateral-locked-modal-desc')}
        value={`${formatted.collateralLocked} ${collateralToken}`}
        theme={modalTheme}
      />
    ),
  }

  if (collateralLockedUSD && !collateralLocked.isZero()) {
    contentCardSettings.footnote = formatted.collateralLockedUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
