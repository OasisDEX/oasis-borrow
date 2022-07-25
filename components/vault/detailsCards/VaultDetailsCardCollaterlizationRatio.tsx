import BigNumber from 'bignumber.js'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import {
  AfterPillProps,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardModal,
} from '../VaultDetails'

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

export function VaultDetailsCardCollateralizationRatio(
  props: ManageStandardBorrowVaultState & AfterPillProps,
) {
  const {
    vault: { collateralizationRatio },
    afterCollateralizationRatio,
    collateralizationRatioAtNextPrice,
    showAfterPill,
    afterPillColors,
  } = props
  const { t } = useTranslation()
  const openModal = useModal()
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const collRatioNextPriceColor = getCollRatioColor(props, collateralizationRatioAtNextPrice)

  return (
    <VaultDetailsCard
      title={`${t('system.collateralization-ratio')}`}
      value={
        <Text as="span" sx={{ color: collRatioColor }}>
          {formatPercent(collateralizationRatio.times(100), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
        </Text>
      }
      valueAfter={
        showAfterPill &&
        formatPercent(afterCollateralizationRatio.times(100), {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        })
      }
      valueBottom={
        <>
          <Text as="span" sx={{ color: collRatioNextPriceColor }}>
            {formatPercent(collateralizationRatioAtNextPrice.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Text>
          <Text as="span" sx={{ color: 'neutral80' }}>
            {` on next price`}
          </Text>
        </>
      }
      openModal={() =>
        openModal(VaultDetailsCardCollaterlizationRatioModal, {
          collateralRatioOnNextPrice: collateralizationRatioAtNextPrice,
          currentCollateralRatio: collateralizationRatio,
        })
      }
      afterPillColors={afterPillColors}
    />
  )
}
