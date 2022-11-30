import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
import { Flex } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatBigNumber } from '../../../../../helpers/formatters/format'

interface MultiplyInformationProps {
  transactionParameters: IPositionTransition
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
          {`${formatBigNumber(currentPosition.riskRatio.multiple, 2)}x`}
          <VaultChangesInformationArrow />
          {`${formatBigNumber(transactionParameters.simulation.position.riskRatio.multiple, 2)}x`}
        </Flex>
      }
    />
  )
}
