import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { formatPercent } from '../../../helpers/formatters/format'
import { ModalProps } from '../../../helpers/modalHook'
import { VaultDetailsCardModal } from '../VaultDetails'

interface CollaterlizationRatioProps {
  currentCollateralRatio: BigNumber
  collateralRatioOnNextPrice: BigNumber
}

export function VaultDetailsCardCollaterlizationRatioModal({
  currentCollateralRatio,
  collateralRatioOnNextPrice,
  close,
}: ModalProps<CollaterlizationRatioProps>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.collateralization-ratio')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateralization-ratio-calculated')}
        </Text>
        <Heading variant="header3">
          {t('manage-vault.card.collateralization-ratio-header2')}
        </Heading>
        <Card variant="vaultDetailsCardModal">
          {formatPercent(currentCollateralRatio.times(100).absoluteValue(), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateralization-ratio-description')}
        </Text>
        <Heading variant="header3">
          {t('manage-vault.card.collateralization-ratio-next-price')}
        </Heading>
        <Card variant="vaultDetailsCardModal">
          {formatPercent(collateralRatioOnNextPrice.times(100).absoluteValue(), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
        </Card>
      </Grid>
    </VaultDetailsCardModal>
  )
}
