import { IPosition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'
import { Flex } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatAmount } from '../../../../../helpers/formatters/format'

interface OutstandingDebtInformationProps {
  currentPosition: IPosition
  newPosition: IPosition
}

function formatDebtAmount(pos: IPosition, newPositionSymbol: string) {
  if (pos) {
    if (!pos.debt.symbol) {
      // not sure why currentPosition debt symbol is null sometimes, nor why the position exists when we
      return `0 ${newPositionSymbol}`
    } else {
      return `${formatAmount(
        amountFromWei(pos.debt.amount, pos.debt.precision),
        pos.debt.symbol,
      )} ${pos.debt.symbol}`
    }
  } else {
    return '0'
  }
}

export function OutstandingDebtInformation({
  currentPosition,
  newPosition,
}: OutstandingDebtInformationProps) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.outstanding-debt')}
      value={
        <Flex>
          {formatDebtAmount(currentPosition, newPosition.debt.symbol)}
          <VaultChangesInformationArrow />
          {formatDebtAmount(newPosition, newPosition.debt.symbol)}
        </Flex>
      }
    />
  )
}
