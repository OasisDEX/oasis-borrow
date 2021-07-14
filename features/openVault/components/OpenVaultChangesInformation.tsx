import { Icon } from '@makerdao/dai-ui-icons'
import { Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { OpenVaultState } from '../openVault'

export function OpenVaultChangesInformation(props: OpenVaultState) {
  const { t } = useTranslation()
  const [showFees, setShowFees] = useState(false)
  const {
    token,
    afterCollateralizationRatio,
    afterLiquidationPrice,
    afterFreeCollateral,
    generateAmount,
    maxGenerateAmountCurrentPrice,
    inputAmountsEmpty,
    depositAmount,
  } = props
  const collRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  // mock txFees
  const txFees = new BigNumber(0.123)

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Vault changes">
      <VaultChangesInformationItem
        label={`${t('system.collateral-locked')}`}
        value={`${formatCryptoBalance(depositAmount || zero)} ${token}`}
      />
      <VaultChangesInformationItem
        label={`${t('system.collateralization-ratio')}`}
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
        label={`${t('system.liquidation-price')}`}
        value={`$${formatCryptoBalance(afterLiquidationPrice || zero)}`}
      />
      <VaultChangesInformationItem
        label={`${t('system.vault-dai-debt')}`}
        value={`${formatCryptoBalance(generateAmount || zero)} DAI`}
      />
      <VaultChangesInformationItem
        label={`${t('system.available-to-withdraw')}`}
        value={`${formatCryptoBalance(afterFreeCollateral || zero)} ${token}`}
      />
      <VaultChangesInformationItem
        label={`${t('system.available-to-generate')}`}
        value={`${formatCryptoBalance(maxGenerateAmountCurrentPrice || zero)} DAI`}
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
            value={`$${formatAmount(txFees, 'USD')}`}
          />
          <VaultChangesInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(txFees, 'USD')}`}
          />
        </Grid>
      )}
    </VaultChangesInformationContainer>
  ) : null
}
