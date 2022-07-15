import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsDynamicStopPriceModal({
  close,
  dynamicStopPrice,
}: ModalProps<{ dynamicStopPrice: BigNumber }>) {
  const { t } = useTranslation()

  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">
          {t('manage-multiply-vault.card.dynamic-stop-loss-price')}
        </Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.dynamic-stop-loss-price-desc')}
        </Text>
        <Text variant="header4" sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.current-dynamic-stop-loss-price')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">
            {!dynamicStopPrice.isZero() ? `$${formatAmount(dynamicStopPrice, 'USD')}` : '-'}
          </Heading>
        </Card>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardDynamicStopPrice({
  slRatio,
  afterSlRatio,
  liquidationPrice,
  liquidationRatio,
  afterPillColors,
  showAfterPill,
  isProtected,
}: {
  slRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  isProtected: boolean
  afterSlRatio: BigNumber
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)
  const afterDynamicStopPrice = liquidationPrice.div(liquidationRatio).times(afterSlRatio)

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.dynamic-stop-price')}
      value={isProtected ? `$${formatAmount(dynamicStopPrice, 'USD')}` : '-'}
      valueBottom={
        isProtected ? (
          <>
            ${formatAmount(dynamicStopPrice.minus(liquidationPrice), 'USD')}{' '}
            <Text as="span" sx={{ color: 'neutral80', fontSize: '1' }}>
              {t('manage-multiply-vault.card.above-liquidation-price')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={showAfterPill && `$${formatAmount(afterDynamicStopPrice, 'USD')}`}
      openModal={() => openModal(VaultDetailsDynamicStopPriceModal, { dynamicStopPrice })}
      afterPillColors={afterPillColors}
    />
  )
}
