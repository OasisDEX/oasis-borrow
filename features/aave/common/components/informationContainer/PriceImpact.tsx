import { IPositionTransition } from '@oasisdex/oasis-actions'
import { Text } from '@theme-ui/components'
import { amountFromWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { StrategyTokenBalance } from 'features/aave/common/BaseAaveContext'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface PriceImpactProps {
  tokens: {
    collateral: string
    debt: string
  }
  balance: StrategyTokenBalance
  transactionParameters: IPositionTransition
}

export function PriceImpact({ tokens, transactionParameters, balance }: PriceImpactProps) {
  const { t } = useTranslation()

  const {
    collateral: { price: collateralPrice },
    debt: { price: debtPrice },
  } = balance

  const { toTokenAmount, targetToken, fromTokenAmount, sourceToken } =
    transactionParameters.simulation.swap

  if (fromTokenAmount.eq(zero) || toTokenAmount.eq(zero)) {
    return <></>
  }

  const swapPrice =
    sourceToken.symbol === tokens.collateral
      ? amountFromWei(toTokenAmount, targetToken.precision).div(
          amountFromWei(fromTokenAmount, sourceToken.precision),
        )
      : amountFromWei(fromTokenAmount, sourceToken.precision).div(
          amountFromWei(toTokenAmount, targetToken.precision),
        )

  const marketPrice = collateralPrice?.div(debtPrice || one) || one

  const priceImpact = calculatePriceImpact(marketPrice, swapPrice)

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.price-impact', { token: `${tokens.collateral}/${tokens.debt}` })}
      value={
        <Text>
          {formatCryptoBalance(marketPrice)}{' '}
          <Text as="span" sx={{ color: 'critical100' }}>
            ({formatPercent(priceImpact, { precision: 2 })})
          </Text>
        </Text>
      }
    />
  )
}
