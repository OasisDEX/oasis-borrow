import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  getEstimatedGasFeeText,
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationEstimatedGasFee,
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

import { OpenMultiplyVaultState } from '../pipes/openMultiplyVault'

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
    buyingCollateral,
    buyingCollateralUSD,
    marketPrice,
  } = props
  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  // starting zero balance for UI to show arrows
  const zeroBalance = formatCryptoBalance(zero)
  const { t } = useTranslation()

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('vault-changes.buying-token', { token })}
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
        label={t('system.total-exposure', { token })}
        value={
          <Flex>
            {zeroBalance} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(totalExposure || zero)} {token}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={t('vault-changes.price-impact', { token })}
        value={
          isExchangeLoading ? (
            <AppSpinner />
          ) : (
            <Text>
              ${marketPrice ? formatFiatBalance(marketPrice) : formatFiatBalance(zero)}{' '}
              <Text as="span" sx={{ color: 'onError' }}>
                ({formatPercent(impact, { precision: 2 })})
              </Text>
            </Text>
          )
        }
      />
      <VaultChangesInformationItem
        label={t('vault-changes.slippage-limit')}
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
        label={t('outstanding-debt')}
        value={
          <Flex>
            {zeroBalance} DAI
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterOutstandingDebt || zero)} DAI
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={t('system.collateral-ratio')}
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
        label={t('fees-plus-gas')}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowFees(!showFees)}
          >
            {`${formatAmount(txFees, 'USD')} +`}
            <Text ml={1}>{getEstimatedGasFeeText(props, true)}</Text>
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
          {loanFees.gt(zero) && (
            <VaultChangesInformationItem
              label={t('vault-changes.third-party-fee')}
              value={`$${formatAmount(loanFees, 'USD')}`}
            />
          )}
          <VaultChangesInformationItem
            label={t('vault-changes.oasis-fee')}
            value={`$${formatAmount(oazoFee, 'USD')}`}
          />
          <VaultChangesInformationEstimatedGasFee {...props} />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
