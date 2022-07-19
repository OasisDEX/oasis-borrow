import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import {
  getEstimatedGasFeeText,
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationEstimatedGasFee,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { OpenGuniVaultState } from '../pipes/openGuniVault'

export function GuniOpenMultiplyVaultChangesInformation(props: OpenGuniVaultState) {
  const [showFees, setShowFees] = useState(false)
  const {
    multiply,
    afterOutstandingDebt,
    token,
    impact,
    loanFees,
    oazoFee,
    inputAmountsEmpty,
    isExchangeLoading,
    slippage,
    gettingCollateral,
    gettingCollateralUSD,
    buyingCollateralUSD,
  } = props

  // starting zero balance for UI to show arrows
  const zeroBalance = formatCryptoBalance(zero)
  const { t } = useTranslation()

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title={t('vault-changes.order-information')}>
      <VaultChangesInformationItem
        label={t('vault-changes.getting-token', { token })}
        value={
          <Flex>
            <Text>
              {formatCryptoBalance(gettingCollateral)} GUNI
              {` `}
              <Text as="span" sx={{ color: 'neutral80' }}>
                (${formatAmount(gettingCollateralUSD, 'USD')})
              </Text>
            </Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={t('vault-changes.buying-token', { token: 'USDC' })}
        value={
          <Flex>
            <Text>${formatAmount(buyingCollateralUSD, 'USD')}</Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={t('vault-changes.price-impact', { token: 'USDC' })}
        value={isExchangeLoading ? <AppSpinner /> : formatPercent(impact, { precision: 2 })}
      />
      <VaultChangesInformationItem
        label={t('vault-changes.slippage-limit')}
        value={formatPercent(slippage.times(100), { precision: 2 })}
      />
      <VaultChangesInformationItem
        label={t('vault-changes.multiply')}
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
        label={t('transaction-fee')}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowFees(!showFees)}
          >
            {`${formatAmount(oazoFee, 'USD')} +`}
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
