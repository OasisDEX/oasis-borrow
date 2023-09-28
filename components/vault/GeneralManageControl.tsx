import type { BigNumber } from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { MakerAutomationContext } from 'features/automation/contexts/MakerAutomationContext'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React, { useEffect } from 'react'

import { GeneralManageLayout } from './GeneralManageLayout'

interface GeneralManageControlProps {
  id: BigNumber
}

export function GeneralManageControl({ id }: GeneralManageControlProps) {
  const { context$ } = useMainContext()
  const { generalManageVault$ } = useProductContext()
  const generalManageVaultWithId$ = generalManageVault$(id)
  const [generalManageVaultData, generalManageVaultError] = useObservable(generalManageVaultWithId$)
  const [context] = useObservable(context$)
  const { chainId } = useWalletManagement()

  const account = context?.status === 'connected' ? context.account : ''

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
              followButton={{
                followerAddress: account,
                vaultId: id,
                chainId: chainId,
                protocol: 'maker',
              }}
              chainId={chainId}
            />
          </MakerAutomationContext>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
