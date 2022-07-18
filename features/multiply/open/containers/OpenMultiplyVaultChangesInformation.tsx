import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
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
import { useFeatureToggle } from 'helpers/useFeatureToggle'
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
    stopLossSkipped,
    stopLossLevel,
    ilkData,
    afterLiquidationPrice,
  } = props
  const { t } = useTranslation()
  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  // starting zero balance for UI to show arrows
  const zeroBalance = formatCryptoBalance(zero)

  const dynamicStopLossPrice = afterLiquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel.div(100))

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Order information">
      <VaultChangesInformationItem
        label={t('vault-changes.buying-token', { token })}
        value={
          <Flex>
            <Text>
              {formatCryptoBalance(buyingCollateral)} {token}
              {` `}
              <Text as="span" sx={{ color: 'neutral80' }}>
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
              <Text as="span" sx={{ color: 'critical100' }}>
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
      {stopLossWriteEnabled && stopLossLevel.gt(zero) && !stopLossSkipped && (
        <>
          <Box as="li" sx={{ listStyle: 'none' }}>
            <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
              {t('protection.stop-loss-information')}
            </Text>
          </Box>
          <VaultChangesInformationItem
            label={`${t('protection.stop-loss-coll-ratio')}`}
            value={
              <Flex>
                {formatPercent(stopLossLevel, {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Flex>
            }
          />
          <VaultChangesInformationItem
            label={`${t('protection.dynamic-stop-loss')}`}
            value={<Flex>${formatAmount(dynamicStopLossPrice, 'USD')}</Flex>}
          />
        </>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
