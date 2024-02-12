import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface MorphoCardDataLtvModalProps {
  ltv: BigNumber
  maxLtv: BigNumber
}

export function MorphoCardDataLtvModal({ ltv, maxLtv }: MorphoCardDataLtvModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.ltv.title')}
      description={t('morpho.content-card.ltv.modal-description')}
      value={formatDecimalAsPercent(ltv)}
    >
      <>
        <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
          {t('morpho.content-card.ltv.footnote')}
        </Heading>
        <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
          {t('morpho.content-card.ltv.modal-footnote-description')}
        </Text>
        <Card variant="vaultDetailsCardModal">{formatDecimalAsPercent(maxLtv)}</Card>
      </>
    </DetailsSectionContentSimpleModal>
  )
}
