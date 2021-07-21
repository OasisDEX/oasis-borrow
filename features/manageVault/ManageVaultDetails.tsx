import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCollateralLocked,
  VaultDetailsCardCurrentPrice,
  VaultDetailsCardLiquidationPrice,
  VaultDetailsCardMockedModal,
  VaultDetailsSummaryContainer,
  VaultDetailsSummaryItem,
} from 'components/vault/VaultDetails'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function ManageVaultDetailsSummary({
  vault: { debt, token, freeCollateral, daiYieldFromLockedCollateral },
}: ManageVaultState) {
  const { t } = useTranslation()
  const { symbol } = getToken(token)

  return (
    <VaultDetailsSummaryContainer>
      <VaultDetailsSummaryItem
        label={t('system.vault-dai-debt')}
        value={
          <>
            {formatAmount(debt, 'DAI')}
            {` DAI`}
          </>
        }
      />

      <VaultDetailsSummaryItem
        label={t('system.available-to-withdraw')}
        value={
          <>
            {formatAmount(freeCollateral, symbol)}
            {` ${symbol}`}
          </>
        }
      />
      <VaultDetailsSummaryItem
        label={t('system.available-to-generate')}
        value={
          <>
            {formatAmount(daiYieldFromLockedCollateral, 'DAI')}
            {` DAI`}
          </>
        }
      />
    </VaultDetailsSummaryContainer>
  )
}

export function ManageVaultDetails(props: ManageVaultState) {
  const {
    vault: {
      token,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
    },
    liquidationPriceCurrentPriceDifference,
    afterLiquidationPrice,
    afterCollateralizationRatio,
    afterLockedCollateralUSD,
    collateralizationRatioAtNextPrice,
  } = props
  const { t } = useTranslation()
  const openModal = useModal()
  const collRatioColor = getCollRatioColor(props, collateralizationRatio)
  const collRatioNextPriceColor = getCollRatioColor(props, collateralizationRatioAtNextPrice)

  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <VaultDetailsCardLiquidationPrice
          liquidationPrice={liquidationPrice}
          liquidationPriceCurrentPriceDifference={liquidationPriceCurrentPriceDifference}
          afterLiquidationPrice={afterLiquidationPrice}
        />

        <VaultDetailsCard
          title={`${t('system.collateralization-ratio')}`}
          value={
            <Text as="span" sx={{ color: collRatioColor }}>
              {formatPercent(collateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
          }
          valueAfter={
            !collateralizationRatio.eq(afterCollateralizationRatio) &&
            formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })
          }
          valueBottom={
            <>
              <Text as="span" sx={{ color: collRatioNextPriceColor }}>
                {formatPercent(collateralizationRatioAtNextPrice.times(100), {
                  precision: 2,
                  roundMode: BigNumber.ROUND_DOWN,
                })}
              </Text>
              <Text as="span" sx={{ color: 'text.subtitle' }}>
                {` on next price`}
              </Text>
            </>
          }
          openModal={() => openModal(VaultDetailsCardMockedModal)}
        />

        <VaultDetailsCardCurrentPrice {...props} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
        />
      </Grid>
      <ManageVaultDetailsSummary {...props} />
    </Box>
  )
}
