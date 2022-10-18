import { IStrategy } from '@oasisdex/oasis-actions'
import { Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationItem } from '../../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance, formatPercent } from '../../../../../../helpers/formatters/format'
import { one } from '../../../../../../helpers/zero'
import { calculatePriceImpact } from '../../../../../shared/priceImpact'

interface PriceImpactProps {
  token: string
  collateralToken: string
  collateralPrice?: BigNumber
  tokenPrice?: BigNumber
  transactionParameters: IStrategy
}

export function PriceImpact({
  token,
  collateralToken,
  transactionParameters,
  tokenPrice,
  collateralPrice,
}: PriceImpactProps) {
  const { t } = useTranslation()

  const { toTokenAmount, fromTokenAmount } = transactionParameters.simulation.swap
  const collateralTokenToTokenPrice = toTokenAmount.div(fromTokenAmount)

  const marketPrice = collateralPrice?.div(tokenPrice || one) || one

  const priceImpact = calculatePriceImpact(marketPrice, collateralTokenToTokenPrice)

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.price-impact', { token: `${collateralToken}/${token}` })}
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
