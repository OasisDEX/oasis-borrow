import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { ManageVaultState } from './manageVault'

function VaultDetailsTable({
  vault,
  ilkData,
  afterMaxGenerateAmountCurrentPrice,
  afterDebt,
  afterFreeCollateral,
  errorMessages,
}: ManageVaultState) {
  const { t } = useTranslation()

  const hasErrors = !!errorMessages.length
  return (
    <Box sx={{ gridColumn: '1/3', mt: 6 }}>
      <Heading variant="header3" mb="4">
        {t('vault.vault-details')}
      </Heading>
      <Grid columns="1fr 1fr 1fr" sx={{ border: 'light', borderRadius: 'medium', p: 4 }}>
        <Grid gap={1}>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.vault-dai-debt')}
          </Box>
          <Box>
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatAmount(vault.approximateDebt, 'DAI')}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              DAI
            </Text>
          </Box>
          {!hasErrors && (
            <Flex sx={{ alignItems: 'center' }}>
              <Icon name="arrow_right" size={12} />
              <Box pl={1}>
                <Text sx={{ display: 'inline' }} variant="header4">
                  {formatAmount(afterDebt, 'DAI')}
                </Text>
                <Text
                  sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }}
                  variant="paragraph4"
                >
                  DAI
                </Text>
              </Box>
            </Flex>
          )}
        </Grid>
        <Grid gap={1}>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.available-to-withdraw')}
          </Box>
          <Box variant="text.header3">
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatAmount(vault.freeCollateral, getToken(vault.token).symbol)}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              {vault.token}
            </Text>
          </Box>
          {!hasErrors && (
            <Flex sx={{ alignItems: 'center' }}>
              <Icon name="arrow_right" size={12} />
              <Box pl={1}>
                <Text sx={{ display: 'inline' }} variant="header4">
                  {formatAmount(afterFreeCollateral, getToken(vault.token).symbol)}
                </Text>
                <Text
                  sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }}
                  variant="paragraph4"
                >
                  {vault.token}
                </Text>
              </Box>
            </Flex>
          )}
        </Grid>
        <Grid gap={1}>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.available-to-generate')}
          </Box>
          <Box variant="text.header3">
            <Text sx={{ display: 'inline' }} variant="header3">
              {formatAmount(vault.daiYieldFromLockedCollateral, 'DAI')}
            </Text>
            <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
              DAI
            </Text>
          </Box>
          {!hasErrors && (
            <Flex sx={{ alignItems: 'center' }}>
              <Icon name="arrow_right" size={12} />
              <Box pl={1}>
                <Text sx={{ display: 'inline' }} variant="header4">
                  {formatAmount(afterMaxGenerateAmountCurrentPrice, 'DAI')}
                </Text>
                <Text
                  sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }}
                  variant="paragraph4"
                >
                  DAI
                </Text>
              </Box>
            </Flex>
          )}
        </Grid>
        <Box sx={{ gridColumn: '1/4', borderBottom: 'light', height: '1px', my: 3 }} />
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.liquidation-ratio')}
          </Box>
          <Text sx={{ display: 'inline' }} variant="header3">
            {formatPercent(ilkData.liquidationRatio.times(100), { precision: 2 })}
          </Text>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.stability-fee')}
          </Box>
          <Box variant="text.header3">
            {formatPercent(ilkData.stabilityFee.times(100), { precision: 2 })}
          </Box>
        </Box>
        <Box>
          <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
            {t('system.liquidation-penalty')}
          </Box>
          <Box variant="text.header3">
            {formatPercent(ilkData.liquidationPenalty.times(100), { precision: 2 })}
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}

export function ManageVaultDetails(props: ManageVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    vault: {
      id,
      ilk,
      token,
      collateralizationRatio,
      liquidationPrice,
      lockedCollateral,
      lockedCollateralUSD,
      collateralizationRatioAtNextPrice,
    },
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      dateNextCollateralPrice,
    },
    ilkData: { liquidationRatio },
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    afterCollateralizationRatioAtNextPrice,
  } = props
  const { t } = useTranslation()
  const collRatioColor = collateralizationRatio.isZero()
    ? 'primary'
    : collateralizationRatio.lte(liquidationRatio.times(1.2))
    ? 'onError'
    : 'onSuccess'

  const locked = formatAmount(lockedCollateral, token)
  const lockedUSD = formatAmount(lockedCollateralUSD, token)

  const tokenInfo = getToken(token)

  const newPriceIn = moment(dateNextCollateralPrice).diff(Date.now(), 'minutes')
  const nextPriceDiff = nextCollateralPrice
    ? nextCollateralPrice.minus(currentCollateralPrice).div(currentCollateralPrice).times(100)
    : zero

  const priceChangeColor = nextPriceDiff.isZero()
    ? 'text.muted'
    : nextPriceDiff.gt(zero)
    ? 'onSuccess'
    : 'onError'

  const showAfters = !generateAndPaybackAmountsEmpty || !depositAndWithdrawAmountsEmpty
  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns="1fr 1fr">
      <Heading
        as="h1"
        variant="paragraph2"
        sx={{ gridColumn: '1/3', fontWeight: 'semiBold', borderBottom: 'light', pb: 3 }}
      >
        <Flex>
          <Icon name={tokenInfo.iconCircle} size="26px" sx={{ verticalAlign: 'sub', mr: 2 }} />
          <Text>{t('vault.header', { ilk, id })}</Text>
        </Flex>
      </Heading>
      <Box sx={{ mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.liquidation-price')}
        </Heading>
        <Text variant="display">$ {formatAmount(liquidationPrice, 'USD')}</Text>
        {showAfters && (
          <Text pl={2}>
            {t('after')}: ${formatAmount(afterLiquidationPrice, 'USD')}
          </Text>
        )}
      </Box>
      <Box sx={{ textAlign: 'right', mt: 5 }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateralization-ratio')}
        </Heading>
        <Text sx={{ color: collRatioColor }} variant="display">
          {formatPercent(collateralizationRatio.times(100), { precision: 2 })}
        </Text>
        <Text>
          {t('next')}:{' '}
          {formatPercent(collateralizationRatioAtNextPrice.times(100), { precision: 2 })}
        </Text>
        {showAfters && (
          <>
            <Text>
              {t('after')}:{' '}
              {formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })}
            </Text>
            <Text>
              {t('after-next')}:{' '}
              {formatPercent(afterCollateralizationRatioAtNextPrice.times(100), { precision: 2 })}
            </Text>
          </>
        )}
      </Box>
      {isStaticCollateralPrice ? (
        <Box sx={{ mt: 6 }}>
          <Heading variant="subheader" as="h2">{`${token}/USD price`}</Heading>
          <Text variant="header2">${formatAmount(currentCollateralPrice, 'USD')}</Text>
        </Box>
      ) : (
        <Box sx={{ mt: 6 }}>
          <Box>
            <Heading variant="subheader" as="h2">{`Current ${token}/USD price`}</Heading>
            <Text variant="header2" sx={{ py: 3 }}>
              ${formatAmount(currentCollateralPrice, 'USD')}
            </Text>
          </Box>

          {nextCollateralPrice && (
            <Flex sx={{ alignItems: 'flex-start' }}>
              <Heading variant="subheader" as="h3">
                <Box sx={{ mr: 2 }}>
                  {newPriceIn < 2 ? (
                    <Trans
                      i18nKey="vault.next-price-any-time"
                      count={newPriceIn}
                      components={[<br />]}
                    />
                  ) : (
                    <Trans i18nKey="vault.next-price" count={newPriceIn} components={[<br />]} />
                  )}
                </Box>
              </Heading>
              <Flex
                variant="paragraph2"
                sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
              >
                <Text>${formatAmount(nextCollateralPrice || zero, 'USD')}</Text>
                <Text sx={{ ml: 2 }}>({formatPercent(nextPriceDiff, { precision: 2 })})</Text>
                {nextPriceDiff.isZero() ? null : (
                  <Icon sx={{ ml: 2 }} name={nextPriceDiff.gt(zero) ? 'increase' : 'decrease'} />
                )}
              </Flex>
            </Flex>
          )}
        </Box>
      )}
      <Box sx={{ textAlign: 'right', mt: 6 }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateral-locked')}
        </Heading>
        <Text variant="header2" sx={{ py: 3 }}>
          {locked} {token}
        </Text>
        <Text>$ {lockedUSD}</Text>
      </Box>
      <VaultDetailsTable {...props} />
    </Grid>
  )
}
