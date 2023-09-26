import type { IPosition } from '@oasisdex/dma-library'
import { Flex } from '@theme-ui/components'
import { amountFromWei } from 'blockchain/utils'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface DebtCollateralInformation {
  currentPosition: IPosition
  newPosition: IPosition
}

function formatDebtAmount(pos: IPosition) {
  const amount = pos.debt.amount.lt(zero) ? zero : pos.debt.amount
  return `${formatAmount(amountFromWei(amount, pos.debt.symbol), pos.debt.symbol)} ${
    pos.debt.symbol
  }`
}

function formatCollateralAmount(pos: IPosition) {
  return `${formatAmount(
    amountFromWei(pos.collateral.amount, pos.collateral.symbol),
    pos.collateral.symbol,
  )} ${pos.collateral.symbol}`
}

export function OutstandingDebtInformation({
  currentPosition,
  newPosition,
}: DebtCollateralInformation) {
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

export function TotalCollateralInformation({
  currentPosition,
  newPosition,
}: DebtCollateralInformation) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationItem
      label={t('system.total-collateral')}
      value={
        <Flex>
          {formatCollateralAmount(currentPosition)}
          <VaultChangesInformationArrow />
          {formatCollateralAmount(newPosition)}
        </Flex>
      }
    />
  )
}
