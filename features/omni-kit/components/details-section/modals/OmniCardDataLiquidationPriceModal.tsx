import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardDataWithTheme } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface OmniCardDataLiquidationPriceModalProps extends OmniContentCardDataWithTheme {
  liquidationPenalty: BigNumber
  liquidationPrice: BigNumber
  priceFormat: string
  ratioToCurrentPrice: BigNumber
}

export function OmniCardDataLiquidationPriceModal({
  liquidationPenalty,
  liquidationPrice,
  priceFormat,
  ratioToCurrentPrice,
  theme,
}: OmniCardDataLiquidationPriceModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.liquidation-price.title')}
      description={t('omni-kit.content-card.liquidation-price.modal-description')}
      value={`${formatCryptoBalance(liquidationPrice)} ${priceFormat}`}
      theme={theme}
    >
      {!liquidationPrice.isZero() && !ratioToCurrentPrice.isZero() && (
        <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
          {t(
            `omni-kit.content-card.liquidation-price.modal-footnote-${
              ratioToCurrentPrice.gt(zero) ? 'below' : 'above'
            }`,
            { ratioToCurrentPrice: formatDecimalAsPercent(ratioToCurrentPrice.abs()) },
          )}
        </Text>
      )}
      <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
        {t('omni-kit.content-card.liquidation-price.modal-footnote-title')}
      </Heading>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('omni-kit.content-card.liquidation-price.modal-footnote-description')}
      </Text>
      <Card variant="vaultDetailsCardModal">{formatDecimalAsPercent(liquidationPenalty)}</Card>
    </DetailsSectionContentSimpleModal>
  )
}
