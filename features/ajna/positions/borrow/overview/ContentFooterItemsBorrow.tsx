import BigNumber from 'bignumber.js'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsBorrowProps {
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  cost: BigNumber
  availableToBorrow: BigNumber
  afterAvailableToBorrow?: BigNumber
  availableToWithdraw: BigNumber
  afterAvailableToWithdraw?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsBorrow({
  isLoading,
  collateralToken,
  quoteToken,
  cost,
  availableToBorrow,
  afterAvailableToBorrow,
  availableToWithdraw,
  afterAvailableToWithdraw,
  changeVariant = 'positive',
}: ContentFooterItemsBorrowProps) {
  const { t } = useTranslation()

  const formatted = {
    cost: formatDecimalAsPercent(cost),
    availableToBorrow: `${formatAmount(availableToBorrow, quoteToken)}`,
    afterAvailableToBorrow:
      afterAvailableToBorrow && `${formatAmount(afterAvailableToBorrow, quoteToken)}`,
    availableToWithdraw: `${formatAmount(availableToWithdraw, collateralToken)}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw && `${formatAmount(afterAvailableToWithdraw, collateralToken)}`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('ajna.position-page.borrow.common.footer.annual-net-borrow-cost')}
        value={formatted.cost}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.borrow.common.footer.available-to-borrow')}
        value={`${formatted.availableToBorrow} ${quoteToken}`}
        change={{
          isLoading,
          value:
            afterAvailableToBorrow &&
            `${formatted.afterAvailableToBorrow} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.borrow.common.footer.available-to-withdraw')}
        value={`${formatted.availableToWithdraw} ${collateralToken}`}
        change={{
          isLoading,
          value:
            afterAvailableToWithdraw &&
            `${formatted.afterAvailableToWithdraw} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
    </>
  )
}
