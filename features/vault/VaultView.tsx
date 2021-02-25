import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import {
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
  formatPrecision,
} from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { useTranslation } from 'i18n'
import React from 'react'
import { Box, Button, Grid, Heading, Text } from 'theme-ui'

import { DepositForm } from '../deposit/DepositForm'

interface Props {
  vault: Vault
  account: string
}

export function VaultView({ vault, account }: Props) {
  const { t } = useTranslation()
  const token = vault.token
  const vaultId = vault.id
  const liquidationPrice = vault.liquidationPrice ? formatFiatBalance(vault.liquidationPrice) : 0
  const liquidationPenalty = formatPercent(vault.liquidationPenalty?.times(100))
  const collateralizationRatio = vault.collateralizationRatio
    ? vault.collateralizationRatio.toString()
    : '0'
  const stabilityFee = formatPrecision(vault.stabilityFee, 2)
  const lockedAmount = formatCryptoBalance(vault.collateral)
  const lockedAmountUSD = formatFiatBalance(vault.collateralPrice)
  const availableToWithdraw = formatCryptoBalance(vault.freeCollateral)
  const availableToWithdrawPrice = formatCryptoBalance(vault.freeCollateralPrice)
  const debt = formatCryptoBalance(vault.debt)
  const debtAvailable = formatCryptoBalance(vault?.availableDebt)

  const openModal = useModal()

  return (
    <Grid>
      <Box sx={{ display: 'flex' }}>
        <AppLink as={`/owner/${vault.controller}`} href={`/owner/[address]`}>
          {t('vaults-overview.your-vaults')}
        </AppLink>
        <Text sx={{ mx: 3 }}>{'>'}</Text>
        <Text>{t("vault.header")}</Text>
      </Box>
      <Box>
        <Heading as="h2">{t('system.liquidation-price')}</Heading>
        <Text>{t('system.liquidation-price')}: {liquidationPrice} USD</Text>
        <Text>{t('system.liquidation-penalty')}: {liquidationPenalty}</Text>
      </Box>
      <Box>
        <Heading as="h2">{t('system.collateralization-ratio')}</Heading>
        <Text>{t('system.collateralization-ratio')}: {collateralizationRatio}</Text>
        <Text>{t('system.stability-fee')}: {stabilityFee}%</Text>
      </Box>
      <Box>
        <Heading as="h2">{token} locked</Heading>
        <Text>
          {token} locked: {lockedAmount}
          {token}/{lockedAmountUSD}USD
        </Text>
        <Button onClick={() => openModal(DepositForm, { vaultId: new BigNumber(vault.id) })}>
          Deposit
        </Button>
        <Text>
          Available to withdraw: {availableToWithdraw}
          {token}/{availableToWithdrawPrice}USD
        </Text>
        <Button>Withdraw</Button>
      </Box>
      <Box>
        <Heading as="h2">Outstanding debt</Heading>
        <Text>Outstanding Dai debt {debt}DAI</Text>
        <Text>Available to generate {debtAvailable}DAI</Text>
      </Box>
    </Grid>
  )
}
