import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaCardDataTotalEarningsModalProps {
  quoteToken: string
  withFees?: BigNumber
  withoutFees: BigNumber
}

export function AjnaCardDataTotalEarningsModal({
  quoteToken,
  withFees,
  withoutFees,
}: AjnaCardDataTotalEarningsModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.total-earnings.title')}
      description={t('ajna.content-card.total-earnings.modal-description', { quoteToken })}
      value={`${formatCryptoBalance(withoutFees)} ${quoteToken}`}
      theme={ajnaExtensionTheme}
    >
      {withFees && (
        <>
          <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
            {t('ajna.content-card.total-earnings.modal-footnote-description', { quoteToken })}
          </Text>
          <Card variant="vaultDetailsCardModal">
            {formatCryptoBalance(withFees)} {quoteToken}
          </Card>
        </>
      )}
    </DetailsSectionContentSimpleModal>
  )
}
