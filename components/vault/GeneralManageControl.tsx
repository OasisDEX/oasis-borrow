import type { BigNumber } from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { MakerAutomationContext } from 'features/automation/contexts/MakerAutomationContext'
import { MakerRefinanceContext } from 'features/refinance/MakerRefinanceContext'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useAppConfig } from 'helpers/config'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { ModalProvider } from 'helpers/modalHook'
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
  const { chainId, wallet } = useWalletManagement()
  const { MakerTenderly } = useAppConfig('features')

  const account = context?.status === 'connected' ? context.account : ''

  useEffect(() => {
    return () => {
      generalManageVaultData?.state.clear()
    }
  }, [])

  const vaultHistoryCheck = MakerTenderly
    ? generalManageVaultData?.state.vaultHistory.length
    : generalManageVaultData?.state.vaultHistory.length || undefined

  return (
    <WithErrorHandler error={[generalManageVaultError]}>
      <WithLoadingIndicator
        value={[generalManageVaultData, vaultHistoryCheck]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault]) => (
          <MakerAutomationContext generalManageVault={generalManageVault}>
            <MakerRefinanceContext
              generalManageVault={generalManageVault}
              chainId={chainId}
              address={wallet?.address}
            >
              {/*TODO we should use ModalProvider here
                We need to refactor it so it accepts reactNode as modal content
              */}
              <ModalProvider>
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
              </ModalProvider>
            </MakerRefinanceContext>
          </MakerAutomationContext>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
