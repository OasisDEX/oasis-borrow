import BigNumber from 'bignumber.js'
import {
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCurrentPrice,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const { afterCollateralizationRatio, afterLiquidationPrice, token } = props

  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  const { t } = useTranslation()

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']}>
      <VaultDetailsCard
        title={`${t('system.liquidation-price')}`}
        value={`$${formatAmount(afterLiquidationPrice, 'USD')}`}
        valueBottom={
          <>
            <Text as="span" sx={{ color: collRatioColor }}>
              {formatPercent(afterCollateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {` ${t('system.collateralization-ratio')}`}
            </Text>
          </>
        }
      />

      <VaultDetailsCard
        title={`Buying Power`}
        value={`$${formatAmount(props.afterBuyingPowerUSD, 'USD')}`}
        valueBottom={`${formatAmount(props.afterBuyingPower, token)}`}
      />

      <VaultDetailsCardCurrentPrice {...props} />

      <VaultDetailsCard
        title={`Net Value`}
        value={`$${formatAmount(props.afterNetValueUSD, 'USD')}`}
        valueBottom={`Unrealised P&L 0%`}
      />
    </Grid>
  )
}
