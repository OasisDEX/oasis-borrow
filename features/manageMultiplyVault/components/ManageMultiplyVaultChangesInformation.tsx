import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationArrow,
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
import { useTranslation } from 'react-i18next'

import { ManageMultiplyVaultState } from '../manageMultiplyVault'

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
    buyAmount,
    buyAmountUSD,
    // impact,
    // loanFees,
    fees,
    loanFee,
    oazoFee: multiplyFee,
    marketPrice,
    inputAmountsEmpty,
  } = props
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  // starting zero balance for UI to show arrows
  const zeroBalance = formatCryptoBalance(zero)
  const impact = new BigNumber(0.25)

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Vault Changes">
      <VaultChangesInformationItem
        label={`Buying ${token}`}
        value={
          <Flex>
            {zeroBalance} {token}
            <VaultChangesInformationArrow />
            <Text>
              {formatCryptoBalance(buyAmount || zero)} {token}
              {` `}
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                (${formatAmount(buyAmountUSD || zero, 'USD')})
              </Text>
            </Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`Total ${token} exposure`}
        value={
          <Flex>
            {formatCryptoBalance(lockedCollateral)} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterLockedCollateral)} {token}
          </Flex>
        }
      />

      <VaultChangesInformationItem
        label={`${token} Price (impact)`}
        value={
          <Text>
            ${marketPrice ? formatFiatBalance(marketPrice) : formatFiatBalance(zero)}{' '}
            <Text as="span" sx={{ color: 'onError' }}>
              ({formatPercent(impact, { precision: 2 })})
            </Text>
          </Text>
        }
      />
      <VaultChangesInformationItem label={'Slippage Limit'} value={'5.00 %'} />
      <VaultChangesInformationItem
        label={'Multiply'}
        value={
          <Flex>
            {multiply?.toFixed(2)}x
            <VaultChangesInformationArrow />
            {afterMultiply?.toFixed(2)}x
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
            <Text sx={{ color: afterCollRatioColor }}>
              {formatPercent(afterCollateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={'Transaction Fee'}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowFees(!showFees)}
          >
            ${formatAmount(fees, 'USD')}{' '}
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
            value={`$${formatAmount(loanFee, 'USD')}`}
          />
          <VaultChangesInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(multiplyFee, 'USD')}`}
          />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
