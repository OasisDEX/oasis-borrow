import { Flex, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { getCollRatioColor } from 'components/vault/VaultDetails'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

export function ManageVaultChangesInformation(
  props: ManageStandardBorrowVaultState & { txnCostDisplay?: ReactNode },
) {
  const { t } = useTranslation()
  const {
    afterCollateralizationRatio,
    afterLockedCollateral,
    afterLiquidationPrice,
    afterDebt,
    afterFreeCollateral,
    daiYieldFromTotalCollateral,
    inputAmountsEmpty,
    vault: {
      collateralizationRatio,
      lockedCollateral,
      liquidationPrice,
      debt,
      freeCollateral,
      token,
      daiYieldFromLockedCollateral,
    },
    txnCostDisplay,
  } = props
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)

  return !inputAmountsEmpty ? (
    <VaultChangesInformationContainer title="Vault Changes">
      <VaultChangesInformationItem
        label={`${t('system.collateral-locked')}`}
        value={
          <Flex>
            {formatCryptoBalance(lockedCollateral || zero)} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterLockedCollateral || zero)} {token}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('system.collateralization-ratio')}`}
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
        label={`${t('system.liquidation-price')}`}
        value={
          <Flex>
            {`$${formatCryptoBalance(liquidationPrice || zero)}`}
            <VaultChangesInformationArrow />
            {`$${formatCryptoBalance(afterLiquidationPrice || zero)}`}
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
        label={`${t('system.available-to-withdraw')}`}
        value={
          <Flex>
            {formatCryptoBalance(freeCollateral || zero)} {token}
            <VaultChangesInformationArrow />
            {formatCryptoBalance(afterFreeCollateral || zero)} {token}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('system.available-to-generate')}`}
        value={
          <Flex>
            {`${formatCryptoBalance(daiYieldFromLockedCollateral || zero)} DAI`}
            <VaultChangesInformationArrow />
            {`${formatCryptoBalance(daiYieldFromTotalCollateral || zero)} DAI`}
          </Flex>
        }
      />
      {txnCostDisplay}
    </VaultChangesInformationContainer>
  ) : null
}
