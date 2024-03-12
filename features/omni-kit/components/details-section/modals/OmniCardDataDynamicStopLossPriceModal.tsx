import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading } from 'theme-ui'

interface OmniCardDataStopLossLtvModalProps {
  priceFormat: string
  dynamicStopLossPrice?: BigNumber
}

export const OmniCardDataDynamicStopLossPriceModal = ({
  priceFormat,
  dynamicStopLossPrice,
}: OmniCardDataStopLossLtvModalProps) => {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.dynamic-stop-loss-price.title')}
      description={t('omni-kit.content-card.dynamic-stop-loss-price.modal-description')}
    >
      <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
        {t('omni-kit.content-card.dynamic-stop-loss-price.modal-footnote-title')}
      </Heading>
      <Card variant="vaultDetailsCardModal">
        {dynamicStopLossPrice ? `${formatCryptoBalance(dynamicStopLossPrice)} ${priceFormat}` : '-'}
      </Card>
    </DetailsSectionContentSimpleModal>
  )
}
