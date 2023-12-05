import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaCardDataPositionLendingPriceModalProps {
  highestThresholdPrice: BigNumber
  isShort: boolean
  lendingPrice: BigNumber
  priceFormat: string
  quoteToken: string
}

export function AjnaCardDataPositionLendingPriceModal({
  highestThresholdPrice,
  isShort,
  lendingPrice,
  priceFormat,
  quoteToken,
}: AjnaCardDataPositionLendingPriceModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('ajna.content-card.position-lending-price.title')}
      description={t('ajna.content-card.position-lending-price.modal-description', {
        quoteToken,
      })}
      value={`${formatCryptoBalance(lendingPrice)} ${priceFormat}`}
      theme={ajnaExtensionTheme}
    >
      <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
        {t(
          `ajna.content-card.position-lending-price.modal-footnote-title-${
            isShort ? 'max' : 'min'
          }`,
        )}
      </Heading>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t(
          `ajna.content-card.position-lending-price.modal-footnote-description-${
            isShort ? 'max' : 'min'
          }`,
          { quoteToken },
        )}
      </Text>
      <Card variant="vaultDetailsCardModal">
        {formatCryptoBalance(highestThresholdPrice)} {priceFormat}
      </Card>
    </DetailsSectionContentSimpleModal>
  )
}
