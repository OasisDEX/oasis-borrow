import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  getEstimatedGasFeeTextOld,
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

import { ManageMultiplyVaultState } from '../pipes/manageMultiplyVault'

export function ManageMultiplyVaultChangesInformation(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const [showFees, setShowFees] = useState(false)
  const {
    vault: { collateralizationRatio, lockedCollateral, debt, token },

    multiply,
    afterMultiply,
    afterCollateralizationRatio,
    afterDebt,
    afterLockedCollateral,
    impact,
    slippage,
    fees,
    loanFee,
    oazoFee,
    marketPrice,
    inputAmountsEmpty,
    exchangeDataRequired,
    isExchangeLoading,
    otherAction,
    exchangeAction,
    collateralDelta,
    collateralDeltaUSD,
    originalEditingStage,
  } = props
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  const isCloseAction = originalEditingStage === 'otherActions' && otherAction === 'closeVault'

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer
      title={isCloseAction ? 'Close Vault Information' : 'Vault Changes'}
    >
      {exchangeDataRequired && (
        <VaultChangesInformationItem
          label={exchangeAction === `BUY_COLLATERAL` ? `Buying ${token}` : `Selling ${token}`}
          value={
            <Flex>
              <Text>
                {formatCryptoBalance(collateralDelta?.abs() || zero)} {token}
                {` `}
                <Text as="span" sx={{ color: 'neutral80' }}>
                  (${formatAmount(collateralDeltaUSD?.abs() || zero, 'USD')})
                </Text>
              </Text>
            </Flex>
          }
        />
      )}
      <VaultChangesInformationItem
        label={isCloseAction ? 'Collateral' : `Total ${token} exposure`}
        value={
          <Flex>
            {formatCryptoBalance(lockedCollateral)} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterLockedCollateral)} {token}
          </Flex>
        }
      />

      {exchangeDataRequired && (
        <>
          <VaultChangesInformationItem
            label={`${token} Price (impact)`}
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
            label={'Slippage Limit'}
            value={formatPercent(slippage.times(100), { precision: 2 })}
          />
        </>
      )}
      <VaultChangesInformationItem
        label={'Multiply'}
        value={
          <Flex>
            {multiply?.toFixed(2)}x
            <VaultChangesInformationArrow />
            {isCloseAction ? 'n/a' : `${afterMultiply?.toFixed(2)}x`}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('system.vault-dai-debt')}`}
        value={
          <Flex>
            {`${formatCryptoBalance(debt || zero)} DAI`}
            <VaultChangesInformationArrow />
            {`${formatCryptoBalance(afterDebt || zero)} DAI`}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={'Collateral Ratio'}
        value={
          <Flex>
            <Text sx={{ color: collRatioColor }}>
              {formatPercent(collateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
            <VaultChangesInformationArrow />
            {isCloseAction ? (
              'n/a'
            ) : (
              <Text sx={{ color: afterCollRatioColor }}>
                {formatPercent(afterCollateralizationRatio.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Text>
            )}
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
            {`${formatAmount(fees, 'USD')} +`}
            <Text ml={1}>{getEstimatedGasFeeTextOld(props, true)}</Text>
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
          {loanFee.gt(zero) && (
            <VaultChangesInformationItem
              label={'3rd party protocol fees'}
              value={`$${formatAmount(loanFee, 'USD')}`}
            />
          )}
          <VaultChangesInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(oazoFee, 'USD')}`}
          />
          <VaultChangesInformationEstimatedGasFee {...props} />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
