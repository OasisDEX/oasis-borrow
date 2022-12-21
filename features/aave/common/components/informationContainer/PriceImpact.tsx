import { IPositionTransition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import { Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationItem } from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance, formatPercent } from '../../../../../helpers/formatters/format'
import { one, zero } from '../../../../../helpers/zero'
import { calculatePriceImpact } from '../../../../shared/priceImpact'

interface PriceImpactProps {
  tokens: {
    collateral: string
    debt: string
  }
  collateralPrice?: BigNumber
  debtPrice?: BigNumber
  transactionParameters: IPositionTransition
}

export function PriceImpact({
  tokens,
  transactionParameters,
  debtPrice,
  collateralPrice,
}: PriceImpactProps) {
  const { t } = useTranslation()

  const {
    toTokenAmount,
    targetToken,
    fromTokenAmount,
    sourceToken,
  } = transactionParameters.simulation.swap

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
