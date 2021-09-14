import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { AppSpinner } from 'helpers/AppSpinner'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

export function OpenMultiplyVaultChangesInformation(props: OpenMultiplyVaultState) {
  const [showFees, setShowFees] = useState(false)
  const {
    multiply,
    afterCollateralizationRatio,
    afterOutstandingDebt,
    totalExposure,
    token,
    txFees,
    impact,
    loanFees,
    oazoFee,
    inputAmountsEmpty,
    isExchangeLoading,
    slippage,
    marketPriceMaxSlippage,
    buyingCollateral,
    buyingCollateralUSD,
  } = props
  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  // starting zero balance for UI to show arrows
  const zeroBalance = formatCryptoBalance(zero)
  const { t } = useTranslation()

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={`Buying ${token}`}
        value={
          <Flex>
            <Text>
              {formatCryptoBalance(buyingCollateral)} {token}
              {` `}
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                (${formatAmount(buyingCollateralUSD, 'USD')})
              </Text>
            </Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`Total ${token} exposure`}
        value={
          <Flex>
            {zeroBalance} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(totalExposure || zero)} {token}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${token} Price (impact)`}
        value={
          isExchangeLoading ? (
            <AppSpinner />
          ) : (
            <Text>
              $
              {marketPriceMaxSlippage
                ? formatFiatBalance(marketPriceMaxSlippage)
                : formatFiatBalance(zero)}{' '}
              <Text as="span" sx={{ color: 'onError' }}>
                ({formatPercent(impact, { precision: 2 })})
              </Text>
            </Text>
          )
        }
      />
      <VaultChangesInformationItem
        label={'Slippage Limit'}
        value={formatPercent(slippage.times(100), { precision: 2 })}
      />
      <VaultChangesInformationItem
        label={t('system.multiple')}
        value={
          <Flex>
            {zeroBalance}x
            <VaultChangesInformationArrow />
            {multiply?.toFixed(2)}x
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={'Outstanding Debt'}
        value={
          <Flex>
            {zeroBalance} DAI
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterOutstandingDebt || zero)} DAI
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={'Collateral Ratio'}
        value={
          <Flex>
            {formatPercent(zero.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
            <VaultChangesInformationArrow />
            <Text sx={{ color: collRatioColor }}>
              {formatPercent(afterCollateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={'Transaction fee (excl. gas)'}
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
            value={`$${formatAmount(oazoFee, 'USD')}`}
          />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
