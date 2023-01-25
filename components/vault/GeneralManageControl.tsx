import { BigNumber } from 'bignumber.js'
import { MakerAutomationContext } from 'features/automation/contexts/MakerAutomationContext'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useEffect, useState } from 'react'

import { useAppContext } from '../AppContextProvider'
import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { generalManageVault$, context$ } = useAppContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVaultData, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const [context] = useObservable(context$)

  const account = context?.status === 'connected' ? context.account : ''
  const chainId = context?.chainId

  useEffect(() => {
    return () => {
      generalManageVaultData?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = generalManageVaultData?.state.vaultHistory.length || undefined
  const [isLimitReached, setIsLimitReached] = useState(false)

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
              followButton={
                chainId
                  ? {
                      followerAddress: account,
                      vaultId: id,
                      chainId: chainId,
                      isLimitReached,
                      setIsLimitReached,
                    }
                  : undefined
              }
            />
          </MakerAutomationContext>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
