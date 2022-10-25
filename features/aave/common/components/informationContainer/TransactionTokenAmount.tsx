import { IStrategy } from '@oasisdex/oasis-actions'
import { Flex, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { amountFromWei } from '../../../../../blockchain/utils'
import { VaultChangesInformationItem } from '../../../../../components/vault/VaultChangesInformation'
import { AppSpinner } from '../../../../../helpers/AppSpinner'
import { formatAmount, formatFiatBalance } from '../../../../../helpers/formatters/format'
import { zero } from '../../../../../helpers/zero'

interface BuyingTokenAmountProps {
  transactionParameters: IStrategy
  collateralToken: string
  collateralPrice?: BigNumber
}

export function TransactionTokenAmount({
  transactionParameters,
  collateralToken,
  collateralPrice,
}: BuyingTokenAmountProps) {
  const { t } = useTranslation()
  const balance = transactionParameters.simulation.swap.toTokenAmount
  const amount = amountFromWei(balance, collateralToken)

  const isBuying = transactionParameters.simulation.swap.sourceTokenFee.gt(zero)
  const labelKey = isBuying ? 'vault-changes.buying-token' : 'vault-changes.selling-token'

  const price = collateralPrice?.times(amount)

  return (
    <VaultChangesInformationItem
      label={t(labelKey, { token: collateralToken })}
      value={
        <Flex>
          <Text>
            {formatAmount(amount, collateralToken)} {collateralToken}
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
