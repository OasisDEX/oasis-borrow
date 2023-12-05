import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Text } from 'theme-ui'

interface AjnaCardDataThresholdPriceProps {
  collateralAmount: BigNumber
  debtAmount: BigNumber
  lup?: BigNumber
  thresholdPrice: BigNumber
}

export function AjnaCardDataThresholdPriceModal({
  collateralAmount,
  debtAmount,
  lup,
  thresholdPrice,
}: AjnaCardDataThresholdPriceProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('ajna.content-card.threshold-price.title')}
      description={t('ajna.content-card.threshold-price.modal-description-1')}
      theme={ajnaExtensionTheme}
    >
      <Card
        variant="vaultDetailsCardModal"
        sx={{ fontSize: 2, fontWeight: 'regular', lineHeight: 'body' }}
      >
        <code>
          TP = {t('ajna.content-card.threshold-price.modal-formula')}
          <br />
          {'\u00A0'}
          {'\u00A0'} = {formatCryptoBalance(debtAmount)} / {formatCryptoBalance(collateralAmount)}
          <br />
          {'\u00A0'}
          {'\u00A0'} = {formatCryptoBalance(thresholdPrice)}
        </code>
      </Card>
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.content-card.threshold-price.modal-description-2')}
      </Text>
      <Text variant="boldParagraph3" as="p" sx={{ color: 'neutral80' }}>
        {t('ajna.content-card.threshold-price.modal-subtitle')}
      </Text>
      <Card variant="vaultDetailsCardModal">
        {t('ajna.content-card.threshold-price.title')} = {formatCryptoBalance(thresholdPrice)}
        <br />
        {lup && `${t('ajna.content-card.threshold-price.modal-lup')} = ${formatCryptoBalance(lup)}`}
      </Card>
    </DetailsSectionContentSimpleModal>
  )
}
