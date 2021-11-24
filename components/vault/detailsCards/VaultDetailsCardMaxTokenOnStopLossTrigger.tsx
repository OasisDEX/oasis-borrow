import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsCardMaxTokenOnStopLossTriggerModal({ close }: ModalProps) {
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Max Token On Stop Loss Trigger</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          VaultDetailsCardMaxTokenOnStopLossTriggerModal dummy modal
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardMaxTokenOnStopLossTrigger({
  slRatio,
  afterSlRatio,
  liquidationPrice,
  afterPillColors,
  showAfterPill,
  isProtected,
  debt,
  collateralAmountLocked,
  afterLockedCollateral,
  afterDebt,
  afterLiquidationPrice,
  liquidationRatio,
  token,
}: {
  slRatio: BigNumber
  afterSlRatio?: BigNumber
  liquidationPrice: BigNumber
  isProtected: boolean
  debt: BigNumber
  collateralAmountLocked: BigNumber
  liquidationRatio: BigNumber
  token: string
  afterLockedCollateral?: BigNumber
  afterDebt?: BigNumber
  afterLiquidationPrice?: BigNumber
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()
  console.log(slRatio.toNumber())
  const ethDuringLiquidation = !liquidationPrice.isZero()
    ? debt.times(liquidationRatio).div(liquidationPrice)
    : zero

  const dynamicStopPrice = !liquidationPrice.isZero()
    ? liquidationPrice.div(liquidationRatio).times(slRatio)
    : zero

  const afterDynamicStopPrice = afterLiquidationPrice
    ? afterLiquidationPrice.div(liquidationRatio).times(afterSlRatio || zero)
    : zero

  const maxEth =
    !collateralAmountLocked.isZero() && !dynamicStopPrice.isZero()
      ? collateralAmountLocked.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
      : zero

  const afterMaxEth =
    afterLockedCollateral && afterDebt
      ? afterLockedCollateral
          .times(afterDynamicStopPrice)
          .minus(afterDebt)
          .div(afterDynamicStopPrice)
      : zero

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', { token })}
      value={isProtected && !maxEth.isZero() ? `${formatAmount(maxEth, token)} ${token}` : '-'}
      valueBottom={
        !slRatio.isZero() && !collateralAmountLocked.isZero() ? (
          <>
            ${formatAmount(ethDuringLiquidation.minus(maxEth), token)} {token}{' '}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {t('manage-multiply-vault.card.saving-comp-to-liquidation')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={
        showAfterPill &&
        `${t('manage-multiply-vault.card.up-to')} $${formatAmount(afterMaxEth, token)} ${token}`
      }
      openModal={() => openModal(VaultDetailsCardMaxTokenOnStopLossTriggerModal)}
      afterPillColors={afterPillColors}
    />
  )
}
