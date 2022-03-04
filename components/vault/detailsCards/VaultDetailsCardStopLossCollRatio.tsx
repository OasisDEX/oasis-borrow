import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

export function VaultDetailsStopLossCollRatioModal({
  close,
  slRatio,
}: ModalProps<{ slRatio: BigNumber }>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.stop-loss-coll-ratio')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.stop-loss-coll-ratio-desc')}
        </Text>
        <Text variant="header4" sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.current-stop-loss-coll-ratio')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">
            {!slRatio.isZero() ? formatPercent(slRatio.multipliedBy(100), { precision: 2 }) : '-'}
          </Heading>
        </Card>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardStopLossCollRatio({
  slRatio,
  afterSlRatio,
  collateralizationRatio,
  afterPillColors,
  showAfterPill,
  isProtected,
}: {
  slRatio: BigNumber
  collateralizationRatio: BigNumber
  isProtected: boolean
  afterSlRatio: BigNumber
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.stop-loss-coll-ratio')}
      value={
        isProtected
          ? formatPercent(slRatio.times(100), {
              precision: 2,
            })
          : '-'
      }
      valueBottom={
        <>
          {formatPercent(collateralizationRatio.times(100), {
            precision: 2,
          })}{' '}
          <Text as="span" sx={{ color: 'text.subtitle', fontSize: '1' }}>
            {t('manage-multiply-vault.card.current-coll-ratio')}
          </Text>
        </>
      }
      valueAfter={
        showAfterPill &&
        formatPercent(afterSlRatio.times(100), {
          precision: 2,
        })
      }
      openModal={() => openModal(VaultDetailsStopLossCollRatioModal, { slRatio })}
      afterPillColors={afterPillColors}
    />
  )
}
