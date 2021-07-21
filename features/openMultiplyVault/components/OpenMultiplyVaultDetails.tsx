import {
  VaultDetailsCard,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
} from 'components/vault/VaultDetails'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { Grid } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const { afterLiquidationPrice, afterLiquidationPriceCurrentPriceDifference, token } = props

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']}>
      <VaultDetailsCardLiquidationPrice
        liquidationPrice={afterLiquidationPrice}
        liquidationPriceCurrentPriceDifference={afterLiquidationPriceCurrentPriceDifference}
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
