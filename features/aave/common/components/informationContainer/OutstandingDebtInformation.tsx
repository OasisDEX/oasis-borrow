import { IPosition, IStrategy } from '@oasisdex/oasis-actions'
import { Flex } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { amountFromWei } from '../../../../../blockchain/utils'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { useAppContext } from '../../../../../components/AppContextProvider'
import { useObservable } from '../../../../../helpers/observableHook'

interface OutstandingDebtInformationProps {
  transactionParameters: IStrategy
  currentPosition: IPosition
  debtToken: string
}

export function OutstandingDebtInformation({
  transactionParameters,
  currentPosition,
  debtToken,
}: OutstandingDebtInformationProps) {
  const { t } = useTranslation()

  const { convertToAaveOracleAssetPrice$ } = useAppContext()

  const [currentDebtInDebtToken] = useObservable(
    convertToAaveOracleAssetPrice$(debtToken, currentPosition.debt.amount),
  )

  const [afterDebtInDebtToken] = useObservable(
    convertToAaveOracleAssetPrice$(
      debtToken,
      transactionParameters.simulation.position.debt.amount,
    ),
  )

  return (
    <VaultChangesInformationItem
      label={t('vault-changes.outstanding-debt')}
      value={
        <Flex>
          {currentDebtInDebtToken && formatCryptoBalance(currentDebtInDebtToken)} {debtToken}
          <VaultChangesInformationArrow />
          {afterDebtInDebtToken && formatCryptoBalance(afterDebtInDebtToken)} {debtToken}
        </Flex>
      }
    />
  )
}
