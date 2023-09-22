import type { IPosition, IStrategy } from '@oasisdex/dma-library'
import { Flex } from '@theme-ui/components'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { displayMultiple } from 'helpers/display-multiple'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface MultiplyInformationProps {
  transactionParameters: IStrategy
  currentPosition: IPosition
}

export function MultiplyInformation({
  transactionParameters,
  currentPosition,
}: MultiplyInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.multiply')}
      value={
        <Flex>
          {displayMultiple(currentPosition.riskRatio.multiple)}
          <VaultChangesInformationArrow />
          {displayMultiple(transactionParameters.simulation.position.riskRatio.multiple)}
        </Flex>
      }
    />
  )
}
