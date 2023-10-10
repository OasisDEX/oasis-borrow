import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsMultiplyProps {
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  totalExposure: BigNumber
  afterTotalExposure?: BigNumber
  positionDebt: BigNumber
  afterPositionDebt?: BigNumber
  multiple: BigNumber
  afterMultiple?: BigNumber
  buyingPower: BigNumber
  afterBuyingPower?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentFooterItemsMultiply({
  isLoading,
  collateralToken,
  quoteToken,
  totalExposure,
  afterTotalExposure,
  positionDebt,
  afterPositionDebt,
  multiple,
  afterMultiple,
  buyingPower,
  afterBuyingPower,
  changeVariant = 'positive',
}: ContentFooterItemsMultiplyProps) {
  const { t } = useTranslation()

  const formatted = {
    totalExposure: `${formatCryptoBalance(totalExposure)} ${collateralToken}`,
    afterTotalExposure:
      afterTotalExposure && `${formatCryptoBalance(afterTotalExposure)} ${collateralToken}`,
    positionDebt: `${formatCryptoBalance(positionDebt)} ${quoteToken}`,
    afterPositionDebt:
      afterPositionDebt && `${formatCryptoBalance(afterPositionDebt)} ${quoteToken}`,
    multiple: `${multiple.toFixed(2)}x`,
    afterMultiple: afterMultiple && `${afterMultiple.toFixed(2)}x`,
    buyingPower: `${formatCryptoBalance(buyingPower)} USD`,
    afterBuyingPower: afterBuyingPower && `${formatFiatBalance(afterBuyingPower)} USD`,
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('ajna.position-page.multiply.common.footer.total-exposure', {
          token: collateralToken,
        })}
        value={formatted.totalExposure}
        change={{
          isLoading,
          value:
            afterTotalExposure &&
            `${formatted.afterTotalExposure} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.multiply.common.footer.position-debt')}
        value={formatted.positionDebt}
        change={{
          isLoading,
          value:
            afterPositionDebt && `${formatted.afterPositionDebt} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.multiply.common.footer.multiple')}
        value={formatted.multiple}
        change={{
          isLoading,
          value: afterMultiple && `${formatted.afterMultiple} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
      <DetailsSectionFooterItem
        title={t('ajna.position-page.multiply.common.footer.buying-power')}
        value={formatted.buyingPower}
        change={{
          isLoading,
          value:
            afterBuyingPower && `${formatted.afterBuyingPower} ${t('system.cards.common.after')}`,
          variant: changeVariant,
        }}
      />
    </>
  )
}
