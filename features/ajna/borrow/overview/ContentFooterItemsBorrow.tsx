import BigNumber from 'bignumber.js'
import { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsBorrowProps {
  collateralToken: string
  quoteToken: string
  cost: BigNumber
  afterCost?: BigNumber
  availableToBorrow: BigNumber
  afterAvailableToBorrow?: BigNumber
  availableToWithdraw: BigNumber
  afterAvailableToWithdraw?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsBorrow({
  collateralToken,
  quoteToken,
  cost,
  afterCost,
  availableToBorrow,
  afterAvailableToBorrow,
  availableToWithdraw,
  afterAvailableToWithdraw,
  changeVariant = 'positive',
}: ContentFooterItemsBorrowProps) {
  const { t } = useTranslation()

  const formatted = {
    cost: formatDecimalAsPercent(cost),
    afterCost: afterCost && formatDecimalAsPercent(afterCost),
    availableToBorrow: `${formatAmount(availableToBorrow, collateralToken)}`,
    afterAvailableToBorrow:
      afterAvailableToBorrow && `${formatAmount(afterAvailableToBorrow, collateralToken)}`,
    availableToWithdraw: `${formatAmount(availableToWithdraw, quoteToken)}`,
    afterAvailableToWithdraw:
      afterAvailableToWithdraw && `${formatAmount(afterAvailableToWithdraw, quoteToken)}`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('ajna.borrow.common.footer.annual-net-borrow-cost')}
        value={formatted.cost}
        {...(afterCost && {
          change: {
            value: `${formatted.afterCost} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('ajna.borrow.common.footer.available-to-borrow')}
        value={`${formatted.availableToBorrow} ${collateralToken}`}
        {...(afterAvailableToBorrow && {
          change: {
            value: `${formatted.afterAvailableToBorrow} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
      <DetailsSectionFooterItem
        title={t('ajna.borrow.common.footer.available-to-withdraw')}
        value={`${formatted.availableToWithdraw} ${quoteToken}`}
        {...(afterAvailableToWithdraw && {
          change: {
            value: `${formatted.afterAvailableToWithdraw} ${t('system.cards.common.after')}`,
            variant: changeVariant,
          },
        })}
      />
    </>
  )
}
