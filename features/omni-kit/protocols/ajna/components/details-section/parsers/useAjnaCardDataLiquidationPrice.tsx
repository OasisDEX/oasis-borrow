import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataLiquidationPriceParams {
  afterLiquidationPrice?: BigNumber
  isOracless: boolean
  liquidationPrice: BigNumber
  priceFormat: string
}

export function useAjnaCardDataLiquidationPrice({
  afterLiquidationPrice,
  isOracless,
  liquidationPrice,
  priceFormat,
}: AjnaCardDataLiquidationPriceParams): OmniContentCardExtra {
  const { t } = useTranslation()

  return {
    modal: (
      <DetailsSectionContentSimpleModal
        title={t('omni-kit.content-card.liquidation-price.title')}
        description={t('ajna.content-card.liquidation-price.modal-description')}
        value={`${formatCryptoBalance(liquidationPrice)} ${priceFormat}`}
        theme={ajnaExtensionTheme}
      />
    ),
    ...(isOracless && {
      tooltips: {
        value:
          !liquidationPrice.isZero() &&
          `${liquidationPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
        change:
          afterLiquidationPrice &&
          !afterLiquidationPrice.isZero() &&
          `${afterLiquidationPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
      },
    }),
  }
}
