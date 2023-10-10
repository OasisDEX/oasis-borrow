import { VaultDetailsCardModal } from 'components/vault/VaultDetails'
import type { ModalProps } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

export function VaultDetailsBuyingPowerModal({ close }: ModalProps) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.buying-power')}</Heading>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-multiply-vault.card.buying-power-description')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}
