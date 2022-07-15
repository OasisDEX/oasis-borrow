import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

interface CollateralLockedProps {
  token: string
  collateralAmountLocked?: BigNumber
  collateralLockedUSD?: BigNumber
}

function VaultDetailsCardCollateralLockedModal({
  collateralAmountLocked,
  collateralLockedUSD,
  token,
  close,
}: ModalProps<CollateralLockedProps>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('system.collateral-locked')}</Heading>
        <Heading variant="header3">{t('manage-vault.card.collateral-locked-amount')}</Heading>
        <Card variant="vaultDetailsCardModal">
          {formatAmount(collateralAmountLocked || zero, getToken(token).symbol)}
        </Card>

        <Heading variant="header3">{t('manage-vault.card.collateral-locked-USD')}</Heading>
        <Card variant="vaultDetailsCardModal">
          {collateralLockedUSD && `$${formatAmount(collateralLockedUSD, 'USD')}`}
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateral-locked-oracles')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardCollateralLocked({
  depositAmountUSD,
  depositAmount,
  afterDepositAmountUSD,
  token,
  afterPillColors,
  showAfterPill,
  relevant = true,
}: {
  depositAmountUSD?: BigNumber
  depositAmount?: BigNumber
  afterDepositAmountUSD?: BigNumber
  token: string
  relevant?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={`${t('system.collateral-locked')}`}
      value={`$${formatAmount(depositAmountUSD || zero, 'USD')}`}
      valueAfter={showAfterPill && `$${formatAmount(afterDepositAmountUSD || zero, 'USD')}`}
      valueBottom={
        <>
          {formatAmount(depositAmount || zero, getToken(token).symbol)}
          <Text as="span" sx={{ color: 'neutral80' }}>
            {` ${getToken(token).symbol}`}
          </Text>
        </>
      }
      openModal={() =>
        openModal(VaultDetailsCardCollateralLockedModal, {
          token: token,
          collateralAmountLocked: depositAmount,
          collateralLockedUSD: afterDepositAmountUSD,
        })
      }
      afterPillColors={afterPillColors}
      relevant={relevant}
    />
  )
}
