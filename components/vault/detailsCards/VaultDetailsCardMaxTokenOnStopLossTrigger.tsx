import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsCardMaxTokenOnStopLossTriggerModal({ close, token }: ModalProps) {
  const { t } = useTranslation()

  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">
          {t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', { token })}
        </Heading>
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
  lockedCollateral,
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
  lockedCollateral?: BigNumber
  vaultDebt?: BigNumber
} & AfterPillProps) {
  const { t } = useTranslation()
  const openModal = useModal()
  const ethDuringLiquidation = !liquidationPrice.isZero()
    ? debt.times(liquidationRatio).div(liquidationPrice)
    : zero

  const dynamicStopPrice = !liquidationPrice.isZero()
    ? liquidationPrice.div(liquidationRatio).times(slRatio)
    : zero

  const afterDynamicStopPrice = !liquidationPrice.isZero()
    ? liquidationPrice.div(liquidationRatio).times(afterSlRatio || zero)
    : zero

  const maxEth =
    !collateralAmountLocked.isZero() && !dynamicStopPrice.isZero()
      ? collateralAmountLocked.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
      : zero

  const afterMaxEth =
    lockedCollateral && debt && lockedCollateral.times(afterDynamicStopPrice).minus(debt).gt(zero)
      ? lockedCollateral.times(afterDynamicStopPrice).minus(debt).div(afterDynamicStopPrice)
      : zero

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', { token })}
      value={isProtected && !maxEth.isZero() ? `${formatAmount(maxEth, token)} ${token}` : '-'}
      valueBottom={
        !slRatio.isZero() && !maxEth.isZero() ? (
          <>
            ${formatAmount(ethDuringLiquidation.minus(maxEth), token)} {token}{' '}
            <Text as="span" sx={{ color: 'text.subtitle', fontSize: '1' }}>
              {t('manage-multiply-vault.card.saving-comp-to-liquidation')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={
        showAfterPill &&
        !maxEth.isZero() &&
        `${t('manage-multiply-vault.card.up-to')} $${formatAmount(afterMaxEth, token)} ${token}`
      }
      openModal={() => openModal(VaultDetailsCardMaxTokenOnStopLossTriggerModal, { token })}
      afterPillColors={afterPillColors}
    />
  )
}
