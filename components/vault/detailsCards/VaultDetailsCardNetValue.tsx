import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Grid, Heading, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { Vault } from '../../../blockchain/vaults'
import { PriceInfo } from '../../../features/shared/priceInfo'
import {
  formatAmount,
  formatCryptoBalance,
  formatPercent,
} from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

interface NetValueProps {
  marketPrice?: BigNumber
  netValueUSD: BigNumber
  totalGasSpentUSD: BigNumber
  currentPnL: BigNumber
  vault?: Vault
  priceInfo: PriceInfo
}

export function VaultDetailsNetValueModal({
  marketPrice,
  netValueUSD,
  totalGasSpentUSD,
  vault,
  currentPnL,
  priceInfo,
  close,
}: ModalProps<NetValueProps>) {
  const { t } = useTranslation()
  const collateralTags = vault ? (getToken(vault?.token).tags as String[]) : []
  const isCollateralLpToken = vault ? collateralTags.includes('lp-token') : false
  const renderCollateralValue = !isCollateralLpToken

  const oraclePrice = priceInfo.currentCollateralPrice

  const lockedCollateralUSD = isCollateralLpToken
    ? vault?.lockedCollateralUSD || zero
    : vault && marketPrice
    ? vault.lockedCollateral.times(marketPrice)
    : zero

  const daiDebtUndercollateralizedToken = vault
    ? isCollateralLpToken
      ? vault.debt.dividedBy(oraclePrice)
      : marketPrice
      ? vault.debt.dividedBy(marketPrice)
      : zero
    : zero

  const netValueUndercollateralizedToken = vault
    ? isCollateralLpToken
      ? netValueUSD.dividedBy(oraclePrice)
      : marketPrice
      ? netValueUSD.dividedBy(marketPrice)
      : zero
    : zero

  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.net-value')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2 }}>
          {isCollateralLpToken
            ? t('manage-multiply-vault.card.based-on-price-lp')
            : t('manage-multiply-vault.card.based-on-price')}
        </Text>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2, fontWeight: 'bold' }}>
          ${formatCryptoBalance(marketPrice || oraclePrice)}
        </Text>
      </Grid>
      {/* Grid for just DESKTOP */}
      <Grid
        gap={2}
        columns={[1, 2, 3]}
        variant="subheader"
        sx={{ fontSize: 2, pb: 2, display: ['none', 'none', 'grid'] }}
      >
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>

        <Box>{t('manage-multiply-vault.card.collateral-value-in-vault')}</Box>

        <Box>{`${vault ? formatCryptoBalance(vault.lockedCollateral) : ''} ${
          vault ? vault.token : ''
        }`}</Box>
        <Box>{`$${formatCryptoBalance(lockedCollateralUSD)}`}</Box>
        <Box>{t('manage-multiply-vault.card.dai-debt-in-vault')}</Box>
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(daiDebtUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{`$${vault ? formatCryptoBalance(vault.debt) : ''}`}</Box>

        <Box>{t('net-value')}</Box>
        {renderCollateralValue ? (
          <Box>
            {vault ? `${formatCryptoBalance(netValueUndercollateralizedToken)} ${vault.token}` : ''}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{`$${formatAmount(netValueUSD, 'USD')}`}</Box>
      </Grid>

      {/* Grid for MOBILE && TABLETs */}
      <Grid
        gap={2}
        columns={[2, 1]}
        variant="subheader"
        sx={{ fontSize: 2, pb: 2, display: ['grid', 'grid', 'none'] }}
      >
        <Box sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.collateral-value-in-vault')}
        </Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        <Box>
          {`${vault ? formatCryptoBalance(vault.lockedCollateral) : ''} ${
            vault ? vault.token : ''
          }`}
        </Box>
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${formatCryptoBalance(lockedCollateralUSD)}`}</Box>
        <Box sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.dai-debt-in-vault')}
        </Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(daiDebtUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${vault ? formatCryptoBalance(vault.debt) : ''}`}</Box>
        <Box sx={{ fontWeight: 'semiBold' }}>{t('net-value')}</Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(netValueUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${formatAmount(netValueUSD, 'USD')}`}</Box>
      </Grid>

      <Divider variant="styles.hrVaultFormBottom" />
      <Grid gap={2} columns={[1, 2, 3]}>
        <Box>{t('manage-multiply-vault.card.gas-fees')}</Box>
        <Box></Box>
        <Box>{`$${formatAmount(totalGasSpentUSD, 'USD')}`}</Box>
      </Grid>
      <Card
        variant="vaultDetailsCardModal"
        sx={{ fontWeight: 'semiBold', alignItems: 'center', textAlign: 'center' }}
      >
        <Text variant="paragraph2" sx={{ fontSize: 1, pb: 2 }}>
          {t('manage-multiply-vault.card.unrealised-pnl')}
        </Text>
        <Text>{formatPercent(currentPnL.times(100), { precision: 2 })}</Text>
      </Card>
      <Grid>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.formula')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardNetValue({
  netValueUSD,
  afterNetValueUSD,
  afterPillColors,
  showAfterPill,
  currentPnL,
  marketPrice,
  totalGasSpentUSD,
  vault,
  priceInfo,
  relevant = true,
}: {
  netValueUSD: BigNumber
  afterNetValueUSD: BigNumber
  currentPnL: BigNumber
  marketPrice?: BigNumber
  totalGasSpentUSD: BigNumber
  vault: Vault | undefined
  priceInfo: PriceInfo
  relevant?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.net-value')}
      value={`$${formatAmount(netValueUSD, 'USD')}`}
      valueBottom={`${t('manage-multiply-vault.card.unrealised-pnl')} ${formatPercent(
        currentPnL.times(100),
        {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        },
      )}`}
      valueAfter={showAfterPill && `$${formatAmount(afterNetValueUSD, 'USD')}`}
      openModal={() =>
        openModal(VaultDetailsNetValueModal, {
          marketPrice,
          netValueUSD,
          totalGasSpentUSD,
          currentPnL,
          vault,
          priceInfo,
        })
      }
      afterPillColors={afterPillColors}
      relevant={relevant}
    />
  )
}
