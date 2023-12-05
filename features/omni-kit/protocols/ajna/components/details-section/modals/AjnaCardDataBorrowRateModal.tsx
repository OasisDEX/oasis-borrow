import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card, Heading, Text } from 'theme-ui'

interface AjnaCardDataBorrowRateModalProps {
  debtAmount: BigNumber
  borrowRate: BigNumber
  quotePrice?: BigNumber
  quoteToken: string
}

export function AjnaCardDataBorrowRateModal({
  debtAmount,
  borrowRate,
  quotePrice,
  quoteToken,
}: AjnaCardDataBorrowRateModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.borrow-rate.title')}
      description={t('ajna.content-card.borrow-rate.modal-description')}
      value={formatDecimalAsPercent(borrowRate)}
      theme={ajnaExtensionTheme}
    >
      {quotePrice && (
        <>
          <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
            {t('ajna.content-card.borrow-rate.modal-footnote-title', { quoteToken })}
          </Heading>
          <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
            {t('ajna.content-card.borrow-rate.modal-footnote-description', { quoteToken })}
          </Text>
          <Card variant="vaultDetailsCardModal">
            {formatCryptoBalance(debtAmount.times(borrowRate))} {quoteToken}
          </Card>
        </>
      )}
    </DetailsSectionContentSimpleModal>
  )
}
