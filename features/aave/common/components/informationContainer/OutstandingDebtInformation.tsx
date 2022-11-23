import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
import { Flex } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { amountFromWei } from '../../../../../blockchain/utils'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'

interface OutstandingDebtInformationProps {
  transactionParameters: IPositionTransition
  currentPosition: IPosition
}

export function OutstandingDebtInformation({
  transactionParameters,
  currentPosition,
}: OutstandingDebtInformationProps) {
  const { t } = useTranslation()

  const { amount, symbol } = transactionParameters.simulation.position.debt
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.outstanding-debt')}
      value={
        <Flex>
          {formatCryptoBalance(currentPosition.debt.amount)} {symbol}
          <VaultChangesInformationArrow />
          {formatCryptoBalance(amountFromWei(amount, symbol))} {symbol}
        </Flex>
      }
    />
  )
}
