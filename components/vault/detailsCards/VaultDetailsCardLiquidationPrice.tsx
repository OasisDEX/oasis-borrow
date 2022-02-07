import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Card, Grid, Heading, Text } from 'theme-ui'

import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { ProtectionPill } from '../../ProtectionPill'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

interface LiquidationProps {
  liquidationPrice: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
}

function VaultDetailsLiquidationModal({
  liquidationPrice,
  liquidationPriceCurrentPriceDifference,
  close,
}: ModalProps<LiquidationProps>) {
  const { t } = useTranslation()
  return (
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
  stopLossLevel,
  isStopLossEnabled,
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  relevant?: Boolean
  stopLossLevel?: BigNumber
  isStopLossEnabled?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  const dynamicStopPrice = stopLossLevel
    ? liquidationPrice.div(liquidationRatio).times(stopLossLevel)
    : null

  return (
    <VaultDetailsCard
      title={t('system.liquidation-price')}
      value={`$${formatAmount(liquidationPrice, 'USD')}`}
      valueAfter={showAfterPill && `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`}
      extraSlot={
        isStopLossEnabled && dynamicStopPrice ? (
          <Box sx={{ mt: '6px' }}>
            <ProtectionPill value={dynamicStopPrice} />
          </Box>
        ) : null
      }
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
          liquidationPrice: liquidationPrice,
          liquidationPriceCurrentPriceDifference: liquidationPriceCurrentPriceDifference,
        })
      }
      relevant={relevant}
      afterPillColors={afterPillColors}
    />
  )
}
