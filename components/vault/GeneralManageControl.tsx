import { BigNumber } from 'bignumber.js'
import React from 'react'

import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { useAppContext } from '../AppContextProvider'
import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { generalManageVault$, ilkDataList$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const generalManageVaultWithError = useObservableWithError(generalManageVaultWithId$)
  const ilksDataListWithError = useObservableWithError(ilkDataList$)

  return (
    <WithErrorHandler error={[generalManageVaultWithError.error, ilksDataListWithError.error]}>
      <WithLoadingIndicator
        value={[generalManageVaultWithError.value, ilksDataListWithError.value]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, ilkDataList]) => (
          <GeneralManageLayout generalManageVault={generalManageVault} ilkDataList={ilkDataList} />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
