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
  isCollateralActive,
  tokenPrice,
}: {
  slRatio: BigNumber
  afterSlRatio: BigNumber
  liquidationPrice: BigNumber
  isProtected: boolean
  debt: BigNumber
  liquidationRatio: BigNumber
  token: string
  lockedCollateral: BigNumber
  isCollateralActive: boolean
  tokenPrice: BigNumber
} & AfterPillProps) {
  const { t } = useTranslation()
  const openModal = useModal()

  const ethDuringLiquidation = lockedCollateral
    .times(liquidationPrice)
    .minus(debt)
    .div(liquidationPrice)

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)

  const afterDynamicStopPrice = liquidationPrice.div(liquidationRatio).times(afterSlRatio)

  const maxToken = !dynamicStopPrice.isZero()
    ? lockedCollateral.times(dynamicStopPrice).minus(debt).div(dynamicStopPrice)
    : zero

  const afterMaxToken = lockedCollateral
    .times(afterDynamicStopPrice)
    .minus(debt)
    .div(afterDynamicStopPrice)

  const savingCompareToLiquidation = maxToken.minus(ethDuringLiquidation)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(maxToken, token)} ${token}`
    : `${formatAmount(maxToken.multipliedBy(tokenPrice), 'USD')} DAI`

  const afterMaxTokenOrDai = isCollateralActive
    ? `${formatAmount(afterMaxToken, token)} ${token}`
    : `${formatAmount(afterMaxToken.multipliedBy(tokenPrice), 'USD')} DAI`

  const savingTokenOrDai = isCollateralActive
    ? `${formatAmount(savingCompareToLiquidation, token)} ${token}`
    : `${formatAmount(savingCompareToLiquidation.multipliedBy(tokenPrice), 'USD')} DAI`

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.max-token-on-stop-loss-trigger', {
        token: isCollateralActive ? token : 'DAI',
      })}
      value={isProtected && !maxToken.isZero() ? maxTokenOrDai : '-'}
      valueBottom={
        !slRatio.isZero() && !maxToken.isZero() ? (
          <>
            {savingTokenOrDai}{' '}
            <Text as="span" sx={{ color: 'text.subtitle', fontSize: '1' }}>
              {t('manage-multiply-vault.card.saving-comp-to-liquidation')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={
        showAfterPill && (
          <>
            {t('manage-multiply-vault.card.up-to')} {afterMaxTokenOrDai}
          </>
        )
      }
      openModal={() => openModal(VaultDetailsCardMaxTokenOnStopLossTriggerModal, { token })}
      afterPillColors={afterPillColors}
    />
  )
}
