import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface MorphoCardDataBorrowRateModalProps {
  borrowRate: BigNumber
  debtAmount: BigNumber
  quoteToken: string
}

export function MorphoCardDataBorrowRateModal({
  borrowRate,
  debtAmount,
  quoteToken,
}: MorphoCardDataBorrowRateModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.borrow-rate.title')}
      description={t('morpho.content-card.borrow-rate.modal-description')}
      value={formatDecimalAsPercent(borrowRate)}
    >
      <>
        <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
          {t('morpho.content-card.borrow-rate.modal-footnote')} {quoteToken}
        </Heading>
        <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
          {t('morpho.content-card.borrow-rate.modal-footnote-description')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          {formatCryptoBalance(debtAmount.times(borrowRate))} {quoteToken}
        </Card>
      </>
    </DetailsSectionContentSimpleModal>
  )
}
