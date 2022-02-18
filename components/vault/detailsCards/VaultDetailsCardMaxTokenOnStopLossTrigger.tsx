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
  lockedCollateral,
  liquidationRatio,
  token,
}: {
  slRatio: BigNumber
  afterSlRatio: BigNumber
  liquidationPrice: BigNumber
  isProtected: boolean
  debt: BigNumber
  liquidationRatio: BigNumber
  token: string
  lockedCollateral: BigNumber
} & AfterPillProps) {
  const { t } = useTranslation()
  const openModal = useModal()
  const ethDuringLiquidation = debt.times(liquidationRatio).div(liquidationPrice)

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)

  const afterDynamicStopPrice = liquidationPrice.div(liquidationRatio).times(afterSlRatio)

  const maxEth = !dynamicStopPrice.isZero()
    ? lockedCollateral.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
    : zero

  const afterMaxEth = lockedCollateral
    .times(afterDynamicStopPrice)
    .minus(debt)
    .div(afterDynamicStopPrice)

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
        `${t('manage-multiply-vault.card.up-to')} ${formatAmount(afterMaxEth, token)} ${token}`
      }
      openModal={() => openModal(VaultDetailsCardMaxTokenOnStopLossTriggerModal, { token })}
      afterPillColors={afterPillColors}
    />
  )
}
