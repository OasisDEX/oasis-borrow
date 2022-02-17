import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsDynamicStopPriceModal({ close }: ModalProps) {
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Dynamic Stop Price Modal</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          VaultDetailsDynamicStopPriceModal dummy modal
        </Text>
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
  afterSlRatio?: BigNumber
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)
  const afterDynamicStopPrice =
    liquidationPrice && afterSlRatio
      ? liquidationPrice.div(liquidationRatio).times(afterSlRatio)
      : zero

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.dynamic-stop-price')}
      value={
        isProtected && !dynamicStopPrice.isZero()
          ? `$${formatAmount(dynamicStopPrice, 'USD')}`
          : '-'
      }
      valueBottom={
        isProtected && !dynamicStopPrice.isZero() ? (
          <>
            ${formatAmount(dynamicStopPrice.minus(liquidationPrice), 'USD')}{' '}
            <Text as="span" sx={{ color: 'text.subtitle', fontSize: '1' }}>
              {t('manage-multiply-vault.card.above-liquidation-price')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={
        showAfterPill &&
        !dynamicStopPrice.isZero() &&
        `$${formatAmount(afterDynamicStopPrice, 'USD')}`
      }
      openModal={() => openModal(VaultDetailsDynamicStopPriceModal)}
      afterPillColors={afterPillColors}
    />
  )
}
