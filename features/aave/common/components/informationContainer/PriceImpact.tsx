import { IPositionTransition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import { Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationItem } from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance, formatPercent } from '../../../../../helpers/formatters/format'
import { one } from '../../../../../helpers/zero'
import { calculatePriceImpact } from '../../../../shared/priceImpact'

interface PriceImpactProps {
  tokens: {
    collateral: string
    debt: string
  }
  collateralPrice?: BigNumber
  tokenPrice?: BigNumber
  transactionParameters: IPositionTransition
}

export function PriceImpact({
  tokens,
  transactionParameters,
  tokenPrice,
  collateralPrice,
}: PriceImpactProps) {
  const { t } = useTranslation()

  const {
    toTokenAmount,
    targetToken,
    fromTokenAmount,
    sourceToken,
  } = transactionParameters.simulation.swap
  const collateralTokenToTokenPrice = amountFromWei(toTokenAmount, targetToken.precision).div(
    amountFromWei(fromTokenAmount, sourceToken.precision),
  )

  const marketPrice = collateralPrice?.div(tokenPrice || one) || one

  const priceImpact = calculatePriceImpact(marketPrice, collateralTokenToTokenPrice)

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
