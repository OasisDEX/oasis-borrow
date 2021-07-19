import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultChangesInformation(props: OpenMultiplyVaultState) {
  const [showFees, setShowFees] = useState(false)
  const {
    multiply,
    afterCollateralizationRatio,
    afterOutstandingDebt,
    totalExposure,
    buyingCollateral,
    buyingCollateralUSD,
    token,
    txFees,
    quote,
    impact,
    loanFees,
    multiplyFee,
  } = props
  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  return (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={`Buying ${token}`}
        value={
          <Text>
            {formatCryptoBalance(buyingCollateral)} {token}
            {` `}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              (${formatAmount(buyingCollateralUSD, 'USD')})
            </Text>
          </Text>
        }
      />
      <VaultChangesInformationItem
        label={`Total ${token} exposure`}
        value={`${formatCryptoBalance(totalExposure || new BigNumber(0))} ${token}`}
      />
      <VaultChangesInformationItem
        label={`${token} Price (impact)`}
        value={
          <Text>
            $
            {quote?.status === 'SUCCESS'
              ? formatFiatBalance(quote.tokenPrice)
              : formatFiatBalance(zero)}{' '}
            <Text as="span" sx={{ color: 'onError' }}>
              ({formatPercent(impact, { precision: 2 })})
            </Text>
          </Text>
        }
      />
      <VaultChangesInformationItem label={'Slippage Limit'} value={'5.00 %'} />
      <VaultChangesInformationItem label={'Multiply'} value={`${multiply?.toString()}x`} />
      <VaultChangesInformationItem
        label={'Outstanding Debt'}
        value={`${formatCryptoBalance(afterOutstandingDebt)} DAI`}
      />
      <VaultChangesInformationItem
        label={'Collateral Ratio'}
        value={
          <Text sx={{ color: collRatioColor }}>
            {formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Text>
        }
      />
      <VaultChangesInformationItem
        label={'Transaction Fee'}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowFees(!showFees)}
          >
            ${formatAmount(txFees, 'USD')}{' '}
            <Icon
              name={`chevron_${showFees ? 'up' : 'down'}`}
              size="auto"
              width="12px"
              sx={{ ml: 2 }}
            />
          </Flex>
        }
      />
      {showFees && (
        <Grid pl={3} gap={2}>
          <VaultChangesInformationItem
            label={'3rd party protocol fees'}
            value={`$${formatAmount(loanFees, 'USD')}`}
          />
          <VaultChangesInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(multiplyFee, 'USD')}`}
          />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  )
}
