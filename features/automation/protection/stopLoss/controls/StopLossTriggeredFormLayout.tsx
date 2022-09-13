import { Button, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { formatAmount, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'

interface StopLossSummaryInformationProps {
  date: string
  token: string
  tokenPrice: BigNumber
  priceImpact: BigNumber
  isToCollateral: boolean
  paybackAmount: BigNumber
  withdrawAmount: BigNumber
  tokensSold: BigNumber
  collRatio: BigNumber
  totalFee: BigNumber
}

export function StopLossSummaryInformation({
  date,
  token,
  tokenPrice,
  priceImpact,
  isToCollateral,
  paybackAmount,
  withdrawAmount,
  tokensSold,
  totalFee,
  collRatio,
}: StopLossSummaryInformationProps) {
  const { t } = useTranslation()

  const tokenSold = (
    <>
      {formatAmount(tokensSold, token)} {token}
      <Text as="span" sx={{ color: 'neutral80', ml: 1 }}>
        (${formatAmount(tokensSold.multipliedBy(tokenPrice), 'USD')})
      </Text>
    </>
  )

  const tokenOrDaiWithdrawn = isToCollateral
    ? `${formatAmount(withdrawAmount, token)} ${token}`
    : `${formatAmount(withdrawAmount, 'USD')} DAI`

  const impact = (
    <>
      {formatFiatBalance(tokenPrice)}
      <Text as="span" sx={{ color: 'neutral80', ml: 1 }}>
        ({formatPercent(priceImpact, { precision: 2 })})
      </Text>
    </>
  )

  const collateral = (
    <>
      {formatAmount(tokensSold, token)} {token} <VaultChangesInformationArrow />
      {formatAmount(zero, token)}
    </>
  )

  const outstandingDebt = (
    <>
      {formatAmount(paybackAmount, 'USD')} DAI
      <VaultChangesInformationArrow />
      {formatAmount(zero, 'USD')}
    </>
  )

  const collateralRatio = (
    <>
      {formatPercent(collRatio.multipliedBy(100), { precision: 2 })}
      <VaultChangesInformationArrow /> n/a
    </>
  )

  const totalCost = `$${formatAmount(totalFee, 'USD')}`

  return (
    <VaultChangesInformationContainer title={t('protection.stop-loss-summary')}>
      <VaultChangesInformationItem
        label={`${t('system.date')}`}
        value={<Flex>{moment(date).format('MMM D YYYY, h:mm A')}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.token-sold', {
          token,
        })}`}
        value={<Flex>{tokenSold}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.token-or-dai-withdrawn', {
          token,
        })}`}
        value={<Flex>{tokenOrDaiWithdrawn}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('vault-changes.price-impact', {
          token,
        })}`}
        value={<Flex>{impact}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('system.collateral', {
          token,
        })}`}
        value={<Flex>{collateral}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('outstanding-debt', {
          token,
        })}`}
        value={<Flex>{outstandingDebt}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('system.collateral-ratio', {
          token,
        })}`}
        value={<Flex>{collateralRatio}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost', {
          token,
        })}`}
        value={<Flex>{totalCost}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}

interface StopLossTriggeredFormLayoutProps {
  token: string
  onClick: () => void
  paybackAmount: BigNumber
  withdrawAmount: BigNumber
  tokensSold: BigNumber
  tokenPrice: BigNumber
  priceImpact: BigNumber
  date: string
  collRatio: BigNumber
  isToCollateral: boolean
  totalFee: BigNumber
}

export function StopLossTriggeredFormLayout({
  token,
  onClick,
  paybackAmount,
  withdrawAmount,
  tokensSold,
  tokenPrice,
  priceImpact,
  date,
  collRatio,
  isToCollateral,
  totalFee,
}: StopLossTriggeredFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <Box>
        <Text variant="boldParagraph2" mb={2}>
          {t('protection.your-stop-loss-triggered')}
        </Text>
        <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('protection.your-stop-loss-triggered-desc')}
        </Text>
      </Box>
      <StopLossSummaryInformation
        token={token}
        date={date}
        isToCollateral={isToCollateral}
        tokenPrice={tokenPrice}
        priceImpact={priceImpact}
        paybackAmount={paybackAmount}
        withdrawAmount={withdrawAmount}
        tokensSold={tokensSold}
        totalFee={totalFee}
        collRatio={collRatio}
      />
      <Button
        sx={{ width: '100%', justifySelf: 'center', mt: 3 }}
        variant="primary"
        onClick={onClick}
      >
        {t('protection.reopen-position')}
      </Button>
    </Grid>
  )
}
