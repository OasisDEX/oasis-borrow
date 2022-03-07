import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { ModalProps } from '../../../helpers/modalHook'
import { VaultDetailsCardModal } from '../VaultDetails'

export function VaultDetailsBuyingPowerModal({ close }: ModalProps) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.buying-power')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.buying-power-description')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}
