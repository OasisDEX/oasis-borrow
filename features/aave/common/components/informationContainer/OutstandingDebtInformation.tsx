import { IPosition, IPositionTransition } from '@oasisdex/oasis-actions'
import { Flex } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useAppContext } from '../../../../../components/AppContextProvider'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { formatCryptoBalance } from '../../../../../helpers/formatters/format'
import { useObservable } from '../../../../../helpers/observableHook'
import BigNumber from 'bignumber.js'

interface OutstandingDebtInformationProps {
  transactionParameters: IPositionTransition
  currentDebtInDebtToken: BigNumber
  afterDebtInDebtToken: BigNumber
  currentPosition: IPosition
  debtToken: string
}

export function OutstandingDebtInformation({
  transactionParameters,
  currentPosition,
  debtToken,
  currentDebtInDebtToken,
  afterDebtInDebtToken,
}: OutstandingDebtInformationProps) {
  const { t } = useTranslation()

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
