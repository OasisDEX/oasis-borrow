import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { StopLossBannerControl } from '../../../features/automation/controls/StopLossBannerControl'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { useFeatureToggle } from '../../../helpers/useFeatureToggle'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

interface LiquidationProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  vaultId: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
}

function VaultDetailsLiquidationModal({
  liquidationPrice,
  liquidationRatio,
  vaultId,
  liquidationPriceCurrentPriceDifference,
  close,
}: ModalProps<LiquidationProps>) {
  const { t } = useTranslation()
  const automationEnabled = useFeatureToggle('Automation')

  return !automationEnabled ? (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.liquidation-price-description')}
        </Text>
        <Heading variant="header3">
          {t('manage-multiply-vault.card.liquidation-price-current')}
        </Heading>
        <Card variant="vaultDetailsCardModal">{`$${formatAmount(liquidationPrice, 'USD')}`}</Card>
        {liquidationPriceCurrentPriceDifference && (
          <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
            {t(
              'manage-multiply-vault.card.liquidation-percentage-below',
              formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              }),
            )}
          </Text>
        )}
      </Grid>
    </VaultDetailsCardModal>
  ) : (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.liquidation-price-description-AUTO')}
        </Text>
        <Card variant="vaultDetailsCardModal" sx={{ mb: 3 }}>{`$${formatAmount(
          liquidationPrice,
          'USD',
        )}`}</Card>
        <Heading variant="header3">{`${t('system.vault-protection')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('protection.modal-description')}
        </Text>
        <StopLossBannerControl
          liquidationPrice={liquidationPrice}
          liquidationRatio={liquidationRatio}
          vaultId={vaultId}
          onClick={close}
          compact
        />
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardLiquidationPrice({
  liquidationPrice,
  liquidationRatio,
  liquidationPriceCurrentPriceDifference,
  afterLiquidationPrice,
  afterPillColors,
  showAfterPill,
  relevant = true,
  vaultId,
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  vaultId: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  relevant?: Boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('system.liquidation-price')}
      value={`$${formatAmount(liquidationPrice, 'USD')}`}
      valueAfter={showAfterPill && `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`}
      valueBottom={
        liquidationPriceCurrentPriceDifference && (
          <>
            {formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {` ${
                liquidationPriceCurrentPriceDifference.lt(zero) ? 'above' : 'below'
              } current price`}
            </Text>
          </>
        )
      }
      openModal={() =>
        openModal(VaultDetailsLiquidationModal, {
          liquidationPrice,
          liquidationRatio,
          liquidationPriceCurrentPriceDifference,
          vaultId,
        })
      }
      relevant={relevant}
      afterPillColors={afterPillColors}
    />
  )
}
