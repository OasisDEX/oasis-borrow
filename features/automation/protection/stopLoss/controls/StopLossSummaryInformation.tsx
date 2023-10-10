import { Text } from '@theme-ui/components'
import type BigNumber from 'bignumber.js'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import dayjs from 'dayjs'
import { formatAmount, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

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
  feature: string
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
  feature,
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
    <VaultChangesInformationContainer title={t('automation.summary', { feature })}>
      <VaultChangesInformationItem
        label={`${t('system.date')}`}
        value={<Flex>{dayjs(date).format('MMM D YYYY, h:mm A')}</Flex>}
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
