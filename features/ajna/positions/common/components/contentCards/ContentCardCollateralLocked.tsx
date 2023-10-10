import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardCollateralLockedProps {
  isLoading?: boolean
  collateralToken: string
  collateralLocked: BigNumber
  afterCollateralLocked?: BigNumber
  collateralLockedUSD?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardCollateralLocked({
  isLoading,
  collateralToken,
  collateralLocked,
  afterCollateralLocked,
  collateralLockedUSD,
  changeVariant = 'positive',
}: ContentCardCollateralLockedProps) {
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
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.collateral-locked')}
        description={t('ajna.position-page.borrow.common.overview.collateral-locked-modal-desc')}
        value={`${formatted.collateralLocked} ${collateralToken}`}
      />
    ),
  }

  if (collateralLockedUSD && !collateralLocked.isZero()) {
    contentCardSettings.footnote = formatted.collateralLockedUSD
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
