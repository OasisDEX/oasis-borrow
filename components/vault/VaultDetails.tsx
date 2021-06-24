import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { CommonVaultState } from 'helpers/types'
import { zero } from 'helpers/zero'
import React, { ReactNode } from 'react'
import { Box, Card, Flex, Heading, Text } from 'theme-ui'

export function getCollRatioColor({
  afterCollateralizationRatio,
  vaultWillBeAtRiskLevelDanger,
  vaultWillBeUnderCollateralized,
  vaultWillBeAtRiskLevelWarning,
}: CommonVaultState) {
  const collRatioColor = afterCollateralizationRatio.isZero()
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
