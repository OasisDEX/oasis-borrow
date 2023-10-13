import { Flex, Grid, Text } from '@theme-ui/components'
import { Icon } from 'components/Icon'
import {
  getEstimatedGasFeeTextOld,
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationEstimatedGasFee,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { AppSpinner } from 'helpers/AppSpinner'
import { displayMultiple } from 'helpers/display-multiple'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { chevron_down, chevron_up } from 'theme/icons'

export function GuniManageMultiplyVaultChangesInformation(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const [showFees, setShowFees] = useState(false)
  const {
    vault: { debt },
    multiply,
    afterMultiply,
    afterDebt,
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
    collateralDeltaUSD,
    originalEditingStage,
  } = props

  const isCloseAction = originalEditingStage === 'otherActions' && otherAction === 'closeVault'

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title={t('vault-changes.close-vault-information')}>
      {exchangeDataRequired && (
        <VaultChangesInformationItem
          label={t('vault-changes.selling-token', { token: 'USDC' })}
          value={<Text>${formatAmount(collateralDeltaUSD?.abs() || zero, 'USD')}</Text>}
        />
      )}

      {exchangeDataRequired && (
        <>
          <VaultChangesInformationItem
            label={t('vault-changes.price-impact', { token: 'USDC' })}
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
        </>
      )}
      <VaultChangesInformationItem
        label={t('vault-changes.multiply')}
        value={
          <Flex>
            {multiply?.toFixed(2)}x
            <VaultChangesInformationArrow />
            {isCloseAction ? 'n/a' : displayMultiple(afterMultiply)}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('outstanding-debt')}`}
        value={
          <Flex>
            {`${formatCryptoBalance(debt || zero)} DAI`}
            <VaultChangesInformationArrow />
            {`${formatCryptoBalance(afterDebt || zero)} DAI`}
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
            {`${formatAmount(fees, 'USD')} +`}
            <Text ml={1}>{getEstimatedGasFeeTextOld(props, true)}</Text>
            <Icon
              icon={showFees ? chevron_up : chevron_down}
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
              label={t('vault-changes.third-party-fee')}
              value={`$${formatAmount(loanFee, 'USD')}`}
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
