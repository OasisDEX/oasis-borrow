import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardNetBorrowCostProps {
  isLoading?: boolean
  netBorrowCost: BigNumber
  afterNetBorrowCost?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardNetBorrowCost({
  isLoading,
  netBorrowCost,
  afterNetBorrowCost,
  changeVariant = 'positive',
}: ContentCardNetBorrowCostProps) {
  const { t } = useTranslation()

  const formatted = {
    netBorrowCost: formatDecimalAsPercent(netBorrowCost),
    afterNetBorrowCost: afterNetBorrowCost && formatDecimalAsPercent(afterNetBorrowCost),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.multiply.common.overview.net-borrow-cost'),
    value: `${formatted.netBorrowCost}`,
    change: {
      isLoading,
      value:
        afterNetBorrowCost && `${formatted.afterNetBorrowCost} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
