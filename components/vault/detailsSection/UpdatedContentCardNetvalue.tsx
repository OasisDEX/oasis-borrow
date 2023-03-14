import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Grid, Heading, Text } from 'theme-ui'

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
  depositTotalAmounts?: {
    totalDollarAmount: string
    totalEthAmount: string
  }
  withdrawTotalAmounts?: {
    totalDollarAmount: string
    totalEthAmount: string
  }
  totalGasFeesInEth?: string
  currentPnLInUSD?: string
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
  depositTotalAmounts,
  withdrawTotalAmounts,
  totalGasFeesInEth,
  currentPnLInUSD,
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
        <Text variant="paragraph2" sx={{ color: 'neutral80' }}>
          {isCollateralLpToken
            ? t('manage-multiply-vault.card.based-on-price-lp')
            : t('manage-multiply-vault.card.based-on-price')}
          <Text as="span" sx={{ fontWeight: 'bold', ml: 1 }}>
            {marketOrOraclePrice}
          </Text>
        </Text>
      </Grid>
      {/* Grid for just DESKTOP */}
      <Grid
        gap={2}
        columns={[1, 2, 3]}
        variant="paragraph2"
        sx={{ pb: 0, display: ['none', 'none', 'grid'], textAlign: 'right' }}
      >
        <Box />
        {renderCollateralValue ? (
          <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80', pb: 3 }}>
            {t('manage-multiply-vault.card.collateral-value')}
          </Box>
        ) : (
          <Box />
        )}
        <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80' }}>
          {t('manage-multiply-vault.card.usd-value')}
        </Box>

        <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80' }}>{t('net-value')}</Box>

        <Box>
          <Text
            sx={{ fontWeight: 'semiBold' }}
          >{`${netValueUndercollateralizedToken} ${token}`}</Text>
          <Text sx={{ fontSize: 1, color: 'neutral80', fontWeight: 'semiBold' }}>
            {t('manage-multiply-vault.card.total-col')}: {`${lockedCollateral} ${token}`}
          </Text>
        </Box>

        <Box>
          <Text sx={{ fontWeight: 'semiBold' }}>{netValueUSD}</Text>
          <Text sx={{ fontSize: 1, color: 'neutral80', fontWeight: 'semiBold' }}>
            {t('manage-multiply-vault.card.debt')}: {lockedCollateralUSD}
          </Text>
        </Box>
      </Grid>

      {/* Grid for MOBILE && TABLETs */}
      <Grid
        gap={2}
        columns={[2, 1]}
        variant="paragraph2"
        sx={{ pb: 2, display: ['grid', 'grid', 'none'] }}
      >
        <Box sx={{ fontWeight: 'semiBold' }}>{t('net-value')}</Box>
        <Box />
        {renderCollateralValue ? <Box>{t('net-value')}</Box> : <Box />}
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

      <Box sx={{ px: 4 }}>
        <Divider variant="styles.hrVaultFormBottom" />
      </Box>
      <Grid
        sx={{ textAlign: 'right', gridTemplateColumns: 'repeat(3,1fr)' }}
        gap={2}
        columns={[1, 2, 3]}
      >
        <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80' }}>
          {t('manage-multiply-vault.card.deposits')}
        </Box>
        <Text
          sx={{ fontWeight: 'semiBold' }}
        >{`${depositTotalAmounts?.totalEthAmount} ${token}`}</Text>
        <Text sx={{ fontWeight: 'semiBold' }}>${depositTotalAmounts?.totalDollarAmount}</Text>

        <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80' }}>
          {t('manage-multiply-vault.card.withdraws')}
        </Box>
        <Text
          sx={{ fontWeight: 'semiBold' }}
        >{`${withdrawTotalAmounts?.totalEthAmount} ${token}`}</Text>
        <Text sx={{ fontWeight: 'semiBold' }}>${withdrawTotalAmounts?.totalDollarAmount}</Text>

        <Box sx={{ fontSize: 1, fontWeight: 'medium', color: 'neutral80' }}>
          {t('manage-multiply-vault.card.gas-fees')}
        </Box>
        <Text sx={{ fontWeight: 'semiBold' }}>{`${totalGasFeesInEth} ${token}`}</Text>
        <Text sx={{ fontWeight: 'semiBold' }}>{totalGasSpentUSD}</Text>
      </Grid>
      <Card
        variant="vaultDetailsCardModal"
        sx={{ fontWeight: 'semiBold', alignItems: 'center', textAlign: 'center' }}
      >
        <Text variant="paragraph2" sx={{ fontSize: 1, pb: 2, color: 'neutral80' }}>
          {t('manage-multiply-vault.card.unrealised-pnl')}
        </Text>
        <Text sx={{ fontSize: 5, pb: 2, fontWeight: 'regular', color: 'primary100' }}>
          {currentPnL} / {currentPnLInUSD}
        </Text>
      </Card>
      <Grid sx={{ fontStyle: 'italic' }}>
        <Text variant="paragraph2" sx={{ pb: 2, color: 'neutral80' }}>
          {t('manage-multiply-vault.card.formula')}
        </Text>

        <Text variant="paragraph2" sx={{ pb: 2, color: 'neutral80' }}>
          {t('manage-multiply-vault.card.formula-note')}
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
  depositTotalAmounts?: {
    totalDollarAmount: BigNumber
    totalEthAmount: BigNumber
  }
  withdrawTotalAmounts?: {
    totalDollarAmount: BigNumber
    totalEthAmount: BigNumber
  }
  totalGasFeesInEth?: BigNumber
  currentPnLInUSD?: BigNumber
}

export function UpdatedContentCardNetValue({
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
  withdrawTotalAmounts,
  depositTotalAmounts,
  totalGasFeesInEth,
  currentPnLInUSD,
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
    depositTotalAmounts: {
      totalDollarAmount: `${formatAmount(depositTotalAmounts?.totalDollarAmount || zero, 'USD')}`,
      totalEthAmount: `${formatCryptoBalance(depositTotalAmounts?.totalEthAmount || zero)}`,
    },
    withdrawTotalAmounts: {
      totalDollarAmount: `${formatAmount(withdrawTotalAmounts?.totalDollarAmount || zero, 'USD')}`,
      totalEthAmount: `${withdrawTotalAmounts?.totalEthAmount.toString() || zero}`,
    },
    totalGasFeesInEth: `${formatCryptoBalance(totalGasFeesInEth || zero)}`,
    currentPnLInUSD: `$${formatAmount(currentPnLInUSD || zero, 'USD')}`,
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
    depositTotalAmounts: formatted.depositTotalAmounts,
    withdrawTotalAmounts: formatted.withdrawTotalAmounts,
    totalGasFeesInEth: formatted.totalGasFeesInEth,
    currentPnLInUSD: formatted.currentPnLInUSD,
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
