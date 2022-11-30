import { IPositionTransition } from '@oasisdex/oasis-actions'
import { Flex, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { amountFromWei } from '../../../../../blockchain/utils'
import { VaultChangesInformationItem } from '../../../../../components/vault/VaultChangesInformation'
import { AppSpinner } from '../../../../../helpers/AppSpinner'
import { formatAmount, formatFiatBalance } from '../../../../../helpers/formatters/format'

interface BuyingTokenAmountProps {
  transactionParameters: IPositionTransition
  tokens: { collateral: string }
  collateralPrice?: BigNumber
}

export function TransactionTokenAmount({
  transactionParameters,
  tokens,
  collateralPrice,
}: BuyingTokenAmountProps) {
  const { t } = useTranslation()
  const isBuyingCollateral =
    transactionParameters.simulation.swap.targetToken.symbol === tokens.collateral

  const collateralMovement = isBuyingCollateral
    ? transactionParameters.simulation.swap.toTokenAmount
    : transactionParameters.simulation.swap.fromTokenAmount
  const amount = amountFromWei(collateralMovement, tokens.collateral)

  const labelKey = isBuyingCollateral ? 'vault-changes.buying-token' : 'vault-changes.selling-token'

  const price = collateralPrice?.times(amount)

  return (
    <VaultChangesInformationItem
      label={t(labelKey, { token: tokens.collateral })}
      value={
        <Flex>
          <Text>
            {formatAmount(amount, tokens.collateral)} {tokens.collateral}
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
