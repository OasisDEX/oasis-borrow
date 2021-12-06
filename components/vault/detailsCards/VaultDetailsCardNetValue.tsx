import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsNetValueModal({ close }: ModalProps) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.net-value')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.net-value-description')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardNetValue({
  netValueUSD,
  afterNetValueUSD,
  afterPillColors,
  showAfterPill,
  relevant = true,
}: {
  netValueUSD: BigNumber
  afterNetValueUSD: BigNumber
  relevant?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.net-value')}
      value={`$${formatAmount(netValueUSD, 'USD')}`}
      // valueBottom={`Unrealised P&L 0%`}
      valueAfter={showAfterPill && `$${formatAmount(afterNetValueUSD, 'USD')}`}
      openModal={() => openModal(VaultDetailsNetValueModal)}
      afterPillColors={afterPillColors}
      relevant={relevant}
    />
  )
}
