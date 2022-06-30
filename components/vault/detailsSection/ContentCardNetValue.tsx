import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Grid, Heading, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { zero } from '../../../helpers/zero'

interface ContentCardNetValueModalProps {
  token: string
  marketOrOraclePrice: string
  debtUSD: string
  lockedCollateral: string
  lockedCollateralOraclePrice: string
  lockedCollateralMarketPrice: string
  debtTokenOraclePrice: string
  debtTokenMarketPrice: string
  netValueOraclePrice: string
  netValueMarketPrice: string
  currentPnL: string
  netValueUSD: string
  totalGasSpentUSD: string
}

function ContentCardNetValueModal({
  token,
  marketOrOraclePrice,
  debtUSD,
  netValueUSD,
  totalGasSpentUSD,
  currentPnL,
  lockedCollateral,
  lockedCollateralOraclePrice,
  lockedCollateralMarketPrice,
  debtTokenOraclePrice,
  debtTokenMarketPrice,
  netValueOraclePrice,
  netValueMarketPrice,
}: ContentCardNetValueModalProps) {
  const { t } = useTranslation()
  const collateralTags = getToken(token).tags as string[]
  const isCollateralLpToken = collateralTags.includes('lp-token')
  const renderCollateralValue = !isCollateralLpToken

  const lockedCollateralUSD = isCollateralLpToken
    ? lockedCollateralOraclePrice
    : lockedCollateralMarketPrice

  const daiDebtUndercollateralizedToken = isCollateralLpToken
    ? debtTokenOraclePrice
    : debtTokenMarketPrice

  const netValueUndercollateralizedToken = isCollateralLpToken
    ? netValueOraclePrice
    : netValueMarketPrice

  return (
    <>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.net-value')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2 }}>
          {isCollateralLpToken
            ? t('manage-multiply-vault.card.based-on-price-lp')
            : t('manage-multiply-vault.card.based-on-price')}
        </Text>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2, fontWeight: 'bold' }}>
          {marketOrOraclePrice}
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

        <Box>{`${lockedCollateral} ${token}`}</Box>
        <Box>{lockedCollateralUSD}</Box>
        <Box>{t('manage-multiply-vault.card.dai-debt-in-vault')}</Box>
        {renderCollateralValue ? (
          <Box>{`${daiDebtUndercollateralizedToken} ${token}`}</Box>
        ) : (
          <Box />
        )}
        <Box>{debtUSD}</Box>

        <Box>{t('net-value')}</Box>
        {renderCollateralValue ? (
          <Box>{`${netValueUndercollateralizedToken} ${token}`}</Box>
        ) : (
          <Box />
        )}
        <Box>{netValueUSD}</Box>
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
        <Box>{`${lockedCollateral} ${token}`}</Box>
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{lockedCollateralUSD}</Box>
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
          <Box>{`${daiDebtUndercollateralizedToken} ${token}`}</Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{debtUSD}</Box>
        <Box sx={{ fontWeight: 'semiBold' }}>{t('net-value')}</Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        {renderCollateralValue ? (
          <Box>{`${netValueUndercollateralizedToken} ${token}`}</Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{netValueUSD}</Box>
      </Grid>

      <Divider variant="styles.hrVaultFormBottom" />
      <Grid gap={2} columns={[1, 2, 3]}>
        <Box>{t('manage-multiply-vault.card.gas-fees')}</Box>
        <Box />
        <Box>{totalGasSpentUSD}</Box>
      </Grid>
      <Card
        variant="vaultDetailsCardModal"
        sx={{ fontWeight: 'semiBold', alignItems: 'center', textAlign: 'center' }}
      >
        <Text variant="paragraph2" sx={{ fontSize: 1, pb: 2 }}>
          {t('manage-multiply-vault.card.unrealised-pnl')}
        </Text>
        <Text>{currentPnL}</Text>
      </Card>
      <Grid>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.formula')}
        </Text>
      </Grid>
    </>
  )
}

interface ContentCardNetValueProps {
  token: string
  oraclePrice: BigNumber
  marketPrice?: BigNumber
  netValueUSD?: BigNumber
  afterNetValueUSD?: BigNumber
  totalGasSpentUSD?: BigNumber
  currentPnL?: BigNumber
  lockedCollateral?: BigNumber
  lockedCollateralUSD?: BigNumber
  debt?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardNetValue({
  token,
  lockedCollateral,
  lockedCollateralUSD,
  netValueUSD,
  afterNetValueUSD,
  currentPnL,
  totalGasSpentUSD,
  debt,
  oraclePrice,
  marketPrice,
  changeVariant,
}: ContentCardNetValueProps) {
  const { t } = useTranslation()

  const formatted = {
    netValueUSD: `$${formatAmount(netValueUSD || zero, 'USD')}`,
    currentPnL: `${formatPercent((currentPnL || zero).times(100), {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    })}`,
    debtUSD: `$${formatAmount(debt || zero, 'USD')}`,
    afterNetValueUSD: `$${formatAmount(afterNetValueUSD || zero, 'USD')}`,
    totalGasSpentUSD: `$${formatAmount(totalGasSpentUSD || zero, 'USD')}`,
    lockedCollateral: `${formatCryptoBalance(lockedCollateral || zero)}`,
    lockedCollateralOraclePrice: `$${formatAmount(lockedCollateralUSD || zero, 'USD')}`,
    lockedCollateralMarketPrice: `$${formatAmount(
      lockedCollateral && marketPrice ? lockedCollateral.times(marketPrice) : zero,
      'USD',
    )}`,
    debtTokenOraclePrice: `${formatCryptoBalance(debt ? debt.div(oraclePrice) : zero)}`,
    debtTokenMarketPrice: `${formatCryptoBalance(
      debt && marketPrice ? debt.div(marketPrice) : zero,
    )}`,
    netValueOraclePrice: `${formatCryptoBalance(
      netValueUSD ? netValueUSD.div(oraclePrice) : zero,
    )}`,
    netValueMarketPrice: `${formatCryptoBalance(
      netValueUSD && marketPrice ? netValueUSD.div(marketPrice) : zero,
    )}`,
    marketOrOraclePrice: `$${formatAmount(marketPrice || oraclePrice, 'USD')}`,
  }

  const contentCardModalSettings: ContentCardNetValueModalProps = {
    token,
    marketOrOraclePrice: formatted.marketOrOraclePrice,
    debtUSD: formatted.debtUSD,
    netValueUSD: formatted.netValueUSD,
    totalGasSpentUSD: formatted.totalGasSpentUSD,
    currentPnL: formatted.currentPnL,
    lockedCollateral: formatted.lockedCollateral,
    lockedCollateralOraclePrice: formatted.lockedCollateralOraclePrice,
    lockedCollateralMarketPrice: formatted.lockedCollateralMarketPrice,
    debtTokenOraclePrice: formatted.debtTokenOraclePrice,
    debtTokenMarketPrice: formatted.debtTokenMarketPrice,
    netValueOraclePrice: formatted.netValueOraclePrice,
    netValueMarketPrice: formatted.netValueMarketPrice,
  }

  if (lockedCollateral && marketPrice) {
    contentCardModalSettings.lockedCollateralMarketPrice = `$${formatAmount(
      lockedCollateral.times(marketPrice),
      'USD',
    )}`
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.net-value'),
    value: formatted.netValueUSD,
    modal: <ContentCardNetValueModal {...contentCardModalSettings} />,
  }

  if (afterNetValueUSD && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterNetValueUSD} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (currentPnL) {
    contentCardSettings.footnote = `${t('manage-multiply-vault.card.unrealised-pnl')} ${
      formatted.currentPnL
    }`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
