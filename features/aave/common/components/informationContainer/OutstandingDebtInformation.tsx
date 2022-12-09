import { Flex } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatAmount, formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { IPosition } from '@oasisdex/oasis-actions'
import { amountFromWei } from '@oasisdex/utils'

interface OutstandingDebtInformationProps {
  currentPosition: IPosition
  newPosition: IPosition
}

function formatDebtAmount(pos: IPosition) {
  return `${formatAmount(amountFromWei(pos.debt.amount, pos.debt.precision), pos.debt.symbol)} ${
    pos.debt.symbol
  }`
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
          {formatDebtAmount(currentPosition)}
          <VaultChangesInformationArrow />
          {formatDebtAmount(newPosition)}
        </Flex>
      }
    />
  )
}
