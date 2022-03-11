import { Button, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../components/vault/VaultChangesInformation'
import { formatAmount, formatFiatBalance, formatPercent } from '../../../helpers/formatters/format'
import { zero } from '../../../helpers/zero'
import { AutomationFormHeader } from '../common/components/AutomationFormHeader'

interface StopLossSummaryInformationProps {
  date: Date
  token: string
  tokenPrice: BigNumber
  isToCollateral: boolean
  paybackAmount: BigNumber
  withdrawAmount: BigNumber
  tokensSold: BigNumber
  collRatio: BigNumber
  gasFee: BigNumber
  slippage: BigNumber
}

function StopLossSummaryInformation({
  date,
  token,
  tokenPrice,
  isToCollateral,
  paybackAmount,
  withdrawAmount,
  tokensSold,
  gasFee,
  collRatio,
  slippage,
}: StopLossSummaryInformationProps) {
  const { t } = useTranslation()

  const tokenSold = (
    <>
      {formatAmount(tokensSold, token)} {token}
      <Text as="span" sx={{ color: 'text.subtitle', ml: 1 }}>
        (${formatAmount(tokensSold.multipliedBy(tokenPrice), 'USD')})
      </Text>
    </>
  )

  const tokenOrDaiWithdrawn = isToCollateral
    ? `${formatAmount(withdrawAmount, token)} ${token}`
    : `${formatAmount(withdrawAmount.multipliedBy(tokenPrice), 'USD')} DAI`

  const priceImpact = (
    <>
      {formatFiatBalance(tokenPrice)}
      <Text as="span" sx={{ color: 'lavender', ml: 1 }}>
        {/* TODO mocked for now as we don't have necessary data to calculate it*/}(
        {formatPercent(new BigNumber(0), { precision: 2 })})
      </Text>
    </>
  )

  const slippageLimit = formatPercent(slippage, { precision: 2 })

  const collateral = (
    <>
      {formatAmount(withdrawAmount, token)} {token} <VaultChangesInformationArrow />
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

  const totalCost = `$${formatAmount(gasFee, 'USD')}`

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
          token: isToCollateral ? token : 'DAI',
        })}`}
        value={<Flex>{tokenOrDaiWithdrawn}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('vault-changes.price-impact', {
          token,
        })}`}
        value={<Flex>{priceImpact}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('vault-changes.slippage-limit', {
          token,
        })}`}
        value={<Flex>{slippageLimit}</Flex>}
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
  date: Date
  collRatio: BigNumber
  isToCollateral: boolean
  gasFee: BigNumber
  slippage: BigNumber
}

export function StopLossTriggeredFormLayout({
  token,
  onClick,
  paybackAmount,
  withdrawAmount,
  tokensSold,
  tokenPrice,
  date,
  collRatio,
  isToCollateral,
  gasFee,
  slippage,
}: StopLossTriggeredFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        translations={{
          editing: {
            header: t('protection.your-stop-loss-triggered'),
            description: t('protection.your-stop-loss-triggered-desc'),
          },
        }}
      />
      <StopLossSummaryInformation
        token={token}
        date={date}
        isToCollateral={isToCollateral}
        tokenPrice={tokenPrice}
        paybackAmount={paybackAmount}
        withdrawAmount={withdrawAmount}
        tokensSold={tokensSold}
        gasFee={gasFee}
        collRatio={collRatio}
        slippage={slippage}
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
