import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardMaxLendingLTVProps {
  maxLendingPercentage: BigNumber
  price: BigNumber
  quoteToken: string
  collateralToken: string
  afterMaxLendingPercentage?: BigNumber
  isLoading?: boolean
  changeVariant?: ChangeVariantType
}

export function ContentCardMaxLendingLTV({
  maxLendingPercentage,
  price,
  quoteToken,
  collateralToken,
  isLoading,
  afterMaxLendingPercentage,
  changeVariant = 'positive',
}: ContentCardMaxLendingLTVProps) {
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
    footnote: `${formatCryptoBalance(price)} ${quoteToken}`,
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.earn.manage.overview.max-lending-ltv')}
        description={t('ajna.position-page.earn.manage.overview.max-lending-ltv-modal-desc', {
          quoteToken,
          collateralToken,
        })}
        value={formatted.maxLendingPercentage}
      />
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
