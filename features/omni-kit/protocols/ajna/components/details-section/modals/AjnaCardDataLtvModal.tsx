import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaCardDataLtvParams {
  ltv: BigNumber
  maxLtv?: BigNumber
}

export function AjnaCardDataLtvModal({ ltv, maxLtv }: AjnaCardDataLtvParams) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.ltv.title')}
      description={t('ajna.content-card.ltv.modal-description')}
      value={formatDecimalAsPercent(ltv)}
      theme={ajnaExtensionTheme}
    >
      {maxLtv && (
        <>
          <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
            {t('ajna.content-card.ltv.footnote')}
          </Heading>
          <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
            {t('ajna.content-card.ltv.modal-footnote-description')}
          </Text>
          <Card variant="vaultDetailsCardModal">{formatDecimalAsPercent(maxLtv)}</Card>
        </>
      )}
    </DetailsSectionContentSimpleModal>
  )
}
