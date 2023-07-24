import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

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
    value: (
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Icon size={24} name="sparks" color="interactive100" />
        <Box sx={{ mr: 1 }} />
        {formatted.netBorrowCost}
      </Box>
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
