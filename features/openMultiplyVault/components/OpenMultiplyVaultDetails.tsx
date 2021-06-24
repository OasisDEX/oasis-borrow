import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
// import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { OpenMultiplyVaultState } from '../openMultiplyVault'

function VaultDetailsTableItem({
  label,
  value,
}: {
  label: string | JSX.Element
  value: string | JSX.Element
}) {
  return (
    <Grid sx={{ gridTemplateRows: '1fr 1fr' }} gap={0}>
      <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
        {label}
      </Box>
      <Box variant="text.header3">
        <Text sx={{ display: 'inline' }} variant="header3">
          {value}
        </Text>
      </Box>
    </Grid>
  )
}

export function VaultDetailsTable({
  // afterFreeCollateral,
  token,
  // maxGenerateAmountCurrentPrice,
  ilkData,
}: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  return (
    <Box sx={{ gridColumn: ['1', '1/3'], mt: [4, 6] }}>
      <Heading variant="header3" mb="4">
        {t('vault.vault-details')}
      </Heading>
      <Grid
        columns={['1fr 1fr', '1fr 1fr 1fr']}
        sx={{ border: 'light', borderRadius: 'medium', p: [3, 4] }}
      >
        <VaultDetailsTableItem
          label={t('system.vault-dai-debt')}
          value={
            <>
              {formatAmount(zero, 'DAI')} {/* TODO verify */}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                DAI
              </Text>
            </>
          }
        />
        <VaultDetailsTableItem
          label={t('system.available-to-withdraw')}
          value={
            <>
              {formatAmount(zero, getToken(token).symbol)}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                {getToken(token).symbol}
              </Text>
            </>
          }
        />
        <VaultDetailsTableItem
          label={t('system.available-to-generate')}
          value={
            <>
              {/* {formatAmount(maxGenerateAmountCurrentPrice, 'DAI')} */}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                USD
              </Text>
            </>
          }
        />
        <Box
          sx={{
            display: ['none', 'block'],
            gridColumn: '1/4',
            borderBottom: 'light',
            height: '1px',
            my: 3,
          }}
        />
        <VaultDetailsTableItem
          label={t('system.liquidation-ratio')}
          value={formatPercent(ilkData.liquidationRatio.times(100), { precision: 2 })}
        />
        <VaultDetailsTableItem
          label={t('system.stability-fee')}
          value={formatPercent(ilkData.stabilityFee.times(100), { precision: 2 })}
        />
        <VaultDetailsTableItem
          label={t('system.liquidation-penalty')}
          value={formatPercent(ilkData.liquidationPenalty.times(100), { precision: 2 })}
        />
      </Grid>
    </Box>
  )
}

function OpenMultiplyVaultDetailsCard({
  title,
  value,
  valueBottom,
}: {
  title: string
  value: string
  valueBottom: ReactNode
}) {
  return (
    <Card sx={{ border: 'lightMuted' }}>
      <Box p={2} sx={{ fontSize: 2 }}>
        <Text variant="subheader" sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}>
          {title}
        </Text>
        <Heading variant="header2" sx={{ fontWeight: 'semiBold', mt: 1 }}>
          {value}
        </Heading>
        <Box sx={{ mt: 5, fontWeight: 'semiBold' }}>{valueBottom}</Box>
      </Box>
    </Card>
  )
}

export function getCollRatioColor({
  afterCollateralizationRatio,
  vaultWillBeAtRiskLevelDanger,
  vaultWillBeUnderCollateralized,
  vaultWillBeAtRiskLevelWarning,
}: OpenMultiplyVaultState) {
  const collRatioColor = afterCollateralizationRatio.isZero()
    ? 'primary'
    : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
    ? 'onError'
    : vaultWillBeAtRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'

  return collRatioColor
}

export function OpenMultiplyVaultDetails(props: OpenMultiplyVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      collateralPricePercentageChange,
    },
  } = props

  const collRatioColor = getCollRatioColor(props)

  const { t } = useTranslation()

  const priceChangeColor = collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']}>
      <OpenMultiplyVaultDetailsCard
        title={`${t('system.liquidation-price')}`}
        value={`$${formatAmount(afterLiquidationPrice, 'USD')}`}
        valueBottom={
          <>
            <Text as="span" sx={{ color: collRatioColor }}>
              {formatPercent(afterCollateralizationRatio.times(100), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              })}
            </Text>
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {` ${t('system.collateralization-ratio')}`}
            </Text>
          </>
        }
      />

      <OpenMultiplyVaultDetailsCard
        title={`Buying Power`}
        value={`$${formatAmount(props.afterBuyingPower, 'USD')}`}
        valueBottom={`${formatAmount(props.afterBuyingPower, 'USD')}`}
      />

      <OpenMultiplyVaultDetailsCard
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

      <OpenMultiplyVaultDetailsCard
        title={`Net Value`}
        value={`$${formatAmount(props.afterNetValueUSD, 'USD')}`}
        valueBottom={`Unrealised P&L 0%`}
      />
    </Grid>
  )
}
