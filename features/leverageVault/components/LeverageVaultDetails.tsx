import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
// import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Box, Card, Flex, Grid, Heading, Text } from 'theme-ui'

import { LeverageVaultState } from '../leverageVault'

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
}: LeverageVaultState) {
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

function LeverageVaultDetailsCard({
  title,
  value,
  valueBottom,
}: {
  title: string
  value: string
  valueBottom: ReactNode
}) {
  return (
    <Card>
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

export function LeverageVaultDetails(props: LeverageVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    // token,
    // depositAmount,
    // depositAmountUSD,
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      // dateNextCollateralPrice,
      collateralPricePercentageChange,
    },
    // vaultWillBeAtRiskLevelDanger,
    // vaultWillBeUnderCollateralized,
    // vaultWillBeAtRiskLevelWarning,
  } = props
  // const collRatioColor = afterCollateralizationRatio.isZero()
  //   ? 'primary'
  //   : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
  //   ? 'onError'
  //   : vaultWillBeAtRiskLevelWarning
  //   ? 'onWarning'
  //   : 'onSuccess'

  const { t } = useTranslation()

  // const newPriceIn = moment(dateNextCollateralPrice).diff(Date.now(), 'minutes')

  const priceChangeColor = collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']}>
      <LeverageVaultDetailsCard
        title={`${t('system.liquidation-price')}`}
        value={`$${formatAmount(afterLiquidationPrice, 'USD')}`}
        valueBottom={
          <>
            {formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {` ${t('system.collateralization-ratio')}`}
            </Text>
          </>
        }
      />

      <LeverageVaultDetailsCard
        title={`Buying Power`}
        value={`$${formatAmount(props.afterBuyingPower, 'USD')}`}
        valueBottom={`${formatAmount(props.afterBuyingPower, 'USD')}`}
      />

      <LeverageVaultDetailsCard
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

      <LeverageVaultDetailsCard
        title={`Net Value`}
        value={`$${formatAmount(props.afterNetValueUSD, 'USD')}`}
        valueBottom={`Unrealised P&L 0%`}
      />

      <Box>
        <Box as="dl" sx={{ dt: { fontWeight: 'bold' } }}>
          <dt>multiple</dt>
          <dd>{props.multiply?.toString()}x</dd>

          <dt>Collateralization ratio</dt>
          <dd>{props.afterCollateralizationRatio?.times(100).toString()}%</dd>

          <dt>after liquidation price</dt>
          <dd>{props.afterLiquidationPrice.toString()}</dd>

          <dt>current {props.token} price</dt>
          <dd>{props.priceInfo.currentCollateralPrice.toString()}</dd>

          <dt>buying power</dt>
          <dd>
            {props.afterBuyingPower.toString()}
            {props.token}
          </dd>
          <dd>
            {props.afterBuyingPowerUSD.toString()}
            USD
          </dd>

          <dt>Net value</dt>
          <dd>
            {props.afterNetValue.toString()}
            {props.token}
          </dd>
          <dd>{props.afterNetValueUSD.toString()}USD</dd>

          <dt>buying collateral</dt>
          <dd>
            {props.buyingCollateral.toString()}
            {props.token}
          </dd>
          <dd>{props.buyingCollateralUSD.toString()}USD</dd>

          <dt>total exposure</dt>
          <dd>{props.totalExposure?.toString()}</dd>

          <dt>After debt</dt>
          <dd>{props.afterOutstandingDebt?.toString()}DAI</dd>

          <dt>Fees</dt>
          <dd>{props.txFees?.toString()}USD</dd>
        </Box>
      </Box>
      {/* <VaultDetailsTable {...props} /> */}
    </Grid>
  )
}
