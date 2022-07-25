import BigNumber from 'bignumber.js'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { StopLossBannerControl } from '../../../features/automation/protection/controls/StopLossBannerControl'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { useObservable } from '../../../helpers/observableHook'
import { useFeatureToggle } from '../../../helpers/useFeatureToggle'
import { zero } from '../../../helpers/zero'
import { useAppContext } from '../../AppContextProvider'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

interface LiquidationProps {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  vaultId?: BigNumber
  isStopLossEnabled?: boolean
}

function VaultDetailsLiquidationModal({
  liquidationPrice,
  liquidationRatio,
  liquidationPriceCurrentPriceDifference,
  close,
  vaultId,
  isStopLossEnabled,
}: ModalProps<LiquidationProps>) {
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  return !stopLossReadEnabled ? (
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
        {isStopLossEnabled && vaultId && (
          <>
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
  vaultId,
}: {
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  vaultId?: BigNumber
  relevant?: Boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()
  const { automationTriggersData$ } = useAppContext()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

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

  if (vaultId && stopLossReadEnabled) {
    const autoTriggersData$ = automationTriggersData$(vaultId)
    const [automationTriggersData] = useObservable(autoTriggersData$)
    const slData = automationTriggersData ? extractStopLossData(automationTriggersData) : null

    return (
      <VaultDetailsCard
        {...cardDetailsData}
        openModal={() =>
          openModal(VaultDetailsLiquidationModal, {
            liquidationPrice,
            liquidationRatio,
            liquidationPriceCurrentPriceDifference,
            vaultId,
            isStopLossEnabled: slData?.isStopLossEnabled,
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
