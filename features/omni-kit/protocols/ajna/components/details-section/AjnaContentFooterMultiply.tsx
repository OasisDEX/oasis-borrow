import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaContentFooterMultiplyProps {
  afterBuyingPower?: BigNumber
  afterMultiple?: BigNumber
  afterPositionDebt?: BigNumber
  afterTotalExposure?: BigNumber
  buyingPower: BigNumber
  changeVariant?: ChangeVariantType
  collateralToken: string
  isLoading?: boolean
  multiple: BigNumber
  positionDebt: BigNumber
  quoteToken: string
  totalExposure: BigNumber
}

export function AjnaContentFooterMultiply({
  afterBuyingPower,
  afterMultiple,
  afterPositionDebt,
  afterTotalExposure,
  buyingPower,
  changeVariant,
  collateralToken,
  isLoading,
  multiple,
  positionDebt,
  quoteToken,
  totalExposure,
}: AjnaContentFooterMultiplyProps) {
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
