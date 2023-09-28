import BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { AfterPillProps } from 'components/vault/VaultDetails'
import { VaultDetailsCard, VaultDetailsCardModal } from 'components/vault/VaultDetails'
import { StopLossBannerControl } from 'features/automation/protection/stopLoss/controls/StopLossBannerControl'
import { useAppConfig } from 'helpers/config'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface LiquidationProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  isStopLossEnabled?: boolean
}

function VaultDetailsLiquidationModal({
  liquidationPrice,
  liquidationRatio,
  liquidationPriceCurrentPriceDifference,
  close,
  isStopLossEnabled,
}: ModalProps<LiquidationProps>) {
  const { t } = useTranslation()
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

  return !stopLossReadEnabled ? (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-multiply-vault.card.liquidation-price-description')}
        </Text>
        <Heading variant="header3">
          {t('manage-multiply-vault.card.liquidation-price-current')}
        </Heading>
        <Card variant="vaultDetailsCardModal">{`$${formatAmount(liquidationPrice, 'USD')}`}</Card>
        {liquidationPriceCurrentPriceDifference && (
          <Text variant="paragraph3" sx={{ pb: 2 }}>
            {t('manage-multiply-vault.card.liquidation-percentage-below', {
              percentageBelow: formatPercent(
                liquidationPriceCurrentPriceDifference.times(100).absoluteValue(),
                {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                },
              ),
            })}
          </Text>
        )}
      </Grid>
    </VaultDetailsCardModal>
  ) : (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-multiply-vault.card.liquidation-price-description-AUTO')}
        </Text>
        <Card variant="vaultDetailsCardModal" sx={{ mb: 3 }}>{`$${formatAmount(
          liquidationPrice,
          'USD',
        )}`}</Card>
        {isStopLossEnabled && (
          <>
            <Heading variant="header3">{`${t('system.vault-protection')}`}</Heading>
            <Text variant="paragraph3" sx={{ pb: 2 }}>
              {t('protection.modal-description')}
            </Text>
            <StopLossBannerControl
              liquidationPrice={liquidationPrice}
              liquidationRatio={liquidationRatio}
              onClick={close}
              compact
            />
          </>
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
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  relevant?: Boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()
  const {
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()
  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

  const cardDetailsData = {
    title: t('system.liquidation-price'),
    value: `$${formatAmount(liquidationPrice, 'USD')}`,
    valueAfter: showAfterPill && `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`,
    valueBottom: liquidationPriceCurrentPriceDifference && (
      <>
        {formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        })}
        <Text as="span" sx={{ color: 'neutral80' }}>
          {` ${liquidationPriceCurrentPriceDifference.lt(zero) ? 'above' : 'below'} current price`}
        </Text>
      </>
    ),

    relevant,
    afterPillColors,
  }

  if (stopLossReadEnabled) {
    return (
      <VaultDetailsCard
        {...cardDetailsData}
        openModal={() =>
          openModal(VaultDetailsLiquidationModal, {
            liquidationPrice,
            liquidationRatio,
            liquidationPriceCurrentPriceDifference,
            isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
          })
        }
      />
    )
  }

  return (
    <VaultDetailsCard
      {...cardDetailsData}
      openModal={() =>
        openModal(VaultDetailsLiquidationModal, {
          liquidationPrice,
          liquidationRatio,
          liquidationPriceCurrentPriceDifference,
        })
      }
    />
  )
}
