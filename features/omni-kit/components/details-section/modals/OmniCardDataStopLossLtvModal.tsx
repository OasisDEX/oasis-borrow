import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading } from 'theme-ui'

interface OmniCardDataStopLossLtvModalProps {
  stopLossLtv?: BigNumber
}

export const OmniCardDataStopLossLtvModal = ({
  stopLossLtv,
}: OmniCardDataStopLossLtvModalProps) => {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.stop-loss-ltv.title')}
      description={t('omni-kit.content-card.stop-loss-ltv.modal-description')}
    >
      <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
        {t('omni-kit.content-card.stop-loss-ltv.modal-footnote-title')}
      </Heading>
      <Card variant="vaultDetailsCardModal">
        {stopLossLtv ? formatDecimalAsPercent(stopLossLtv) : '-'}
      </Card>
    </DetailsSectionContentSimpleModal>
  )
}
