import type { IPosition, IStrategy } from '@oasisdex/dma-library'
import { Flex } from '@theme-ui/components'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface LtvInformationProps {
  transactionParameters: IStrategy
  currentPosition: IPosition
}

export function LtvInformation({ transactionParameters, currentPosition }: LtvInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.ltv')}
      value={
        <Flex>
          {formatPercent(currentPosition.riskRatio.loanToValue.times(100), {
            precision: 2,
          })}{' '}
          <VaultChangesInformationArrow />
          {formatPercent(
            transactionParameters.simulation.position.riskRatio.loanToValue.times(100),
            {
              precision: 2,
            },
          )}
        </Flex>
      }
    />
  )
}
