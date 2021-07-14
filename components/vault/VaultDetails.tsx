import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { CommonVaultState, WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

export function getCollRatioColor(
  { inputAmountsEmpty, ilkData }: CommonVaultState,
  collateralizationRatio: BigNumber,
) {
  const vaultWillBeAtRiskLevelDanger =
    !inputAmountsEmpty &&
    collateralizationRatio.gte(ilkData.liquidationRatio) &&
    collateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

  const vaultWillBeAtRiskLevelWarning =
    !inputAmountsEmpty &&
    collateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
    collateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

  const vaultWillBeUnderCollateralized =
    !inputAmountsEmpty &&
    collateralizationRatio.lt(ilkData.liquidationRatio) &&
    !collateralizationRatio.isZero()

  const collRatioColor = collateralizationRatio.isZero()
    ? 'primary'
    : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
    ? 'onError'
    : vaultWillBeAtRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'

  return collRatioColor
}

export function getPriceChangeColor({
  priceInfo: { collateralPricePercentageChange },
}: CommonVaultState) {
  const priceChangeColor = collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'

  return priceChangeColor
}

export function VaultDetailsCard({
  title,
  value,
  valueBottom,
}: {
  title: string
  value: ReactNode
  valueBottom?: ReactNode
}) {
  return (
    <Card sx={{ border: 'lightMuted', overflow: 'hidden' }}>
      <Box p={2} sx={{ fontSize: 2 }}>
        <Text variant="subheader" sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}>
          {title}
        </Text>
        <Heading variant="header2" sx={{ fontWeight: 'semiBold', mt: 1 }}>
          {value}
        </Heading>
        <Box sx={{ mt: 5, fontWeight: 'semiBold', minHeight: '1em' }}>{valueBottom}</Box>
      </Box>
    </Card>
  )
}

export function VaultDetailsCardCurrentPrice(props: CommonVaultState) {
  const {
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      collateralPricePercentageChange,
    },
  } = props

  const priceChangeColor = getPriceChangeColor(props)

  return (
    <VaultDetailsCard
      title={`Current Price`}
      value={`$${formatAmount(currentCollateralPrice, 'USD')}`}
      valueBottom={
        isStaticCollateralPrice ? null : (
          <Flex sx={{ whiteSpace: 'pre-wrap' }}>
            <Text sx={{ color: 'text.subtitle' }}>Next </Text>
            <Flex
              variant="paragraph2"
              sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
            >
              <Text>${formatAmount(nextCollateralPrice, 'USD')}</Text>
              <Text sx={{ ml: 2, fontSize: 1 }}>
                {formatPercent(collateralPricePercentageChange.times(100), { precision: 2 })}
              </Text>
            </Flex>
          </Flex>
        )
      }
    />
  )
}

export function VaultDetailsCardCollateralLocked({
  depositAmountUSD,
  depositAmount,
  token,
}: {
  depositAmountUSD?: BigNumber
  depositAmount?: BigNumber
  token: string
}) {
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={`${t('system.collateral-locked')}`}
      value={`$${formatAmount(depositAmountUSD || zero, 'USD')}`}
      valueBottom={
        <>
          {formatAmount(depositAmount || zero, getToken(token).symbol)}
          <Text as="span" sx={{ color: 'text.subtitle' }}>
            {` ${getToken(token).symbol}`}
          </Text>
        </>
      }
    />
  )
}

export function VaultDetailsSummaryContainer({ children }: WithChildren) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted' }}>
      <Grid columns={3} sx={{ py: 3, px: 2 }}>
        {children}
      </Grid>
    </Card>
  )
}

export function VaultDetailsSummaryItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Grid gap={1}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', fontWeight: 'semiBold' }}>
        {label}
      </Text>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
    </Grid>
  )
}
