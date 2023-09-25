import type { IMultiplyStrategy } from '@oasisdex/dma-library'
import { Flex, Text } from '@theme-ui/components'
import { amountFromWei } from 'blockchain/utils'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import type { StrategyTokenBalance } from 'features/aave/types'
import { allDefined } from 'helpers/allDefined'
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAmount, formatFiatBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BuyingTokenAmountProps {
  transactionParameters: IMultiplyStrategy
  tokens: { collateral: string }
  balance: StrategyTokenBalance
}

export function TransactionTokenAmount({
  transactionParameters,
  tokens,
  balance,
}: BuyingTokenAmountProps) {
  const { t } = useTranslation()
  const {
    collateral: { price: collateralPrice },
  } = balance

  const { toTokenAmount, fromTokenAmount, targetToken } = transactionParameters.simulation.swap

  if (!allDefined(toTokenAmount, fromTokenAmount) || toTokenAmount?.lte(zero)) {
    return <></>
  }
  const isBuyingCollateral = targetToken.symbol === tokens.collateral

  const collateralMovement = isBuyingCollateral ? toTokenAmount : fromTokenAmount

  const amount = amountFromWei(collateralMovement, tokens.collateral)

  const labelKey = isBuyingCollateral ? 'vault-changes.buying-token' : 'vault-changes.selling-token'

  const price = collateralPrice?.times(amount)

  return (
    <VaultChangesInformationItem
      label={t(labelKey, { token: tokens.collateral })}
      value={
        <Flex>
          <Text>
            {formatAmount(amount, tokens.collateral === 'USDC' ? 'USD' : tokens.collateral)}{' '}
            {tokens.collateral}
            {` `}
            <Text as="span" sx={{ color: 'neutral80' }}>
              {price ? `$${formatFiatBalance(price)}` : <AppSpinner />}
            </Text>
          </Text>
        </Flex>
      }
    />
  )
}
