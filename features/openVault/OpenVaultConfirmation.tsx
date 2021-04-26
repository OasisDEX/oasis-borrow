import { Icon } from '@makerdao/dai-ui-icons'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { Card, Flex, Grid, Link, Spinner, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'

export function OpenVaultConfirmation({
  stage,
  balanceInfo: { collateralBalance },
  depositAmount,
  generateAmount,
  token,
  afterCollateralizationRatio,
  afterLiquidationPrice,
  id,
  etherscan,
  openTxHash,
  collateralBalanceRemaining,
}: OpenVaultState) {
  const walletBalance = formatCryptoBalance(collateralBalance)
  const intoVault = formatCryptoBalance(depositAmount || zero)
  const remainingInWallet = formatCryptoBalance(collateralBalanceRemaining)
  const daiToBeGenerated = formatCryptoBalance(generateAmount || zero)
  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const afterLiqPrice = formatAmount(afterLiquidationPrice, 'USD')

  return (
    <Grid>
      <Card backgroundColor="Success">
        <Grid columns="1fr 1fr">
          <Text sx={{ fontSize: 1 }}>In your wallet</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {walletBalance} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Moving into Vault</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {intoVault} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Remaining in Wallet</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>
            {remainingInWallet} {token}
          </Text>

          <Text sx={{ fontSize: 1 }}>Dai being generated</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{daiToBeGenerated} DAI</Text>

          <Text sx={{ fontSize: 1 }}>Collateral Ratio</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>{afterCollRatio}</Text>

          <Text sx={{ fontSize: 1 }}>Liquidation Price</Text>
          <Text sx={{ fontSize: 1, textAlign: 'right' }}>${afterLiqPrice}</Text>
        </Grid>
      </Card>

      {stage === 'openInProgress' && (
        <Card sx={{ backgroundColor: 'warning', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Spinner size={25} color="onWarning" />
            <Grid pl={2} gap={1}>
              <Text color="onWarning" sx={{ fontSize: 1 }}>
                Creating your {token} Vault!
              </Text>
              <Link
                href={`${etherscan}/tx/${openTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onWarning" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
      {stage === 'openSuccess' && (
        <Card sx={{ backgroundColor: 'success', border: 'none' }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Icon name="checkmark" size={25} color="onSuccess" />
            <Grid pl={2} gap={1}>
              <Text color="onSuccess" sx={{ fontSize: 1 }}>
                Vault #{id?.toString()} created!
              </Text>
              <Link
                href={`${etherscan}/tx/${openTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Text color="onSuccess" sx={{ fontSize: 1 }}>
                  View on etherscan -{'>'}
                </Text>
              </Link>
            </Grid>
          </Flex>
        </Card>
      )}
    </Grid>
  )
}
