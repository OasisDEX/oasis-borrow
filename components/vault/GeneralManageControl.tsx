import { BigNumber } from 'bignumber.js'
import { MakerAutomationContext } from 'features/automation/contexts/MakerAutomationContext'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useEffect } from 'react'

import { useAppContext } from '../AppContextProvider'
import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { generalManageVault$, context$, termsAcceptance$, checkAcceptanceFromApi$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVaultData, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const [context, contextError] = useObservable(context$)
  // TODO ŁW use api to check version of tos for user
  // const [termsAcceptance] = useObservable(termsAcceptance$)

  const account = context?.status === 'connected' ? context.account : ''
  const chainId = context?.chainId

  useEffect(() => {
    return () => {
      generalManageVaultData?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = generalManageVaultData?.state.vaultHistory.length || undefined

  return (
    <WithErrorHandler error={[generalManageVaultError]}>
      <WithLoadingIndicator
        value={[generalManageVaultData, vaultHistoryCheck]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault]) => (
          <MakerAutomationContext generalManageVault={generalManageVault}>
            <GeneralManageLayout
              generalManageVault={generalManageVault}
              followButtonProps={{
                followerAddress: account,
                vaultId: id,
                docVersion: 'version-11.07.2022', //TODO replace with version from api ł
                chainId: chainId,
              }}
            />
          </MakerAutomationContext>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
