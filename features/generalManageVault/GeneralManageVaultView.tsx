import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { ManageVaultContainer } from 'features/borrow/manage/containers/ManageVaultView'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import React, { ReactNode } from 'react'
import { Container } from 'theme-ui'

import { ManageMultiplyVaultContainer } from '../../components/vault/commonMultiply/ManageMultiplyVaultContainer'
import { DefaultVaultHeader } from '../../components/vault/DefaultVaultHeader'
import { GuniVaultHeader } from '../earn/guni/common/GuniVaultHeader'
import { GuniManageMultiplyVaultDetails } from '../earn/guni/manage/containers/GuniManageMultiplyVaultDetails'
import { GuniManageMultiplyVaultForm } from '../earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { ManageInstiVaultContainer } from '../instiVault/manage/containers/ManageInstiVaultContainer'
import { ManageMultiplyVaultDetails } from '../multiply/manage/containers/ManageMultiplyVaultDetails'
import { ManageMultiplyVaultForm } from '../multiply/manage/containers/ManageMultiplyVaultForm'
import { VaultHistoryView } from '../vaultHistory/VaultHistoryView'
import { VaultType } from './vaultType'

// Temporary stuff for testing insti vaults
export const INSTI_VAULT_IDS: BigNumber[] = []
const instiMockedData = 
  { 
    originationFee: new BigNumber(0.01),
    activeCollRatio: new BigNumber(1.4),
    activeCollRatioPriceUSD: new BigNumber(1300),
    debtCeiling: new BigNumber(500000),
    termEnd: new Date('02/28/2022'),
    fixedFee: new BigNumber(0.015),
    nextFixedFee: new BigNumber(0.014)
  }

export function GeneralManageVaultView({ id }: { id: BigNumber }) {
  const { generalManageVault$, vaultHistory$, vaultMultiplyHistory$ } = useAppContext()
  const manageVaultWithId$ = generalManageVault$(id)
  const manageVaultWithError = useObservableWithError(manageVaultWithId$)
  const vaultHistoryWithError = useObservableWithError(vaultHistory$(id))
  const vaultMultiplyHistoryWithError = useObservableWithError(vaultMultiplyHistory$(id))

  return (
    <WithErrorHandler
      error={[
        manageVaultWithError.error,
        vaultHistoryWithError.error,
        vaultMultiplyHistoryWithError.error,
      ]}
    >
      <WithLoadingIndicator
        value={[
          manageVaultWithError.value,
          vaultHistoryWithError.value,
          vaultMultiplyHistoryWithError.value,
        ]}
        customLoader={<VaultContainerSpinner />}
      >
        {([generalManageVault, vaultHistory, vaultMultiplyHistory]) => {
          switch (generalManageVault.type) {
            case VaultType.Borrow: // todo: add insti vault case
              return (
                <Container variant="vaultPageContainer">
                  {INSTI_VAULT_IDS.some((bn) => bn.eq(id)) ? (
                    <ManageInstiVaultContainer
                      vaultHistory={vaultHistory}
                      manageVault={{ ...generalManageVault.state, ...instiMockedData }}
                    />
                  ) : (
                    <ManageVaultContainer
                      vaultHistory={vaultHistory}
                      manageVault={generalManageVault.state}
                    />
                  )}
                </Container>
              )
            case VaultType.Multiply:
              const vaultIlk = generalManageVault.state.ilkData.ilk
              const multiplyContainerMap: Record<string, ReactNode> = {
                'GUNIV3DAIUSDC1-A': (
                  <ManageMultiplyVaultContainer
                    vaultHistory={vaultMultiplyHistory}
                    manageVault={generalManageVault.state}
                    header={GuniVaultHeader}
                    details={GuniManageMultiplyVaultDetails}
                    form={GuniManageMultiplyVaultForm}
                    history={VaultHistoryView}
                  />
                ),
                'GUNIV3DAIUSDC2-A': (
                  <>
                    <ManageMultiplyVaultContainer
                      vaultHistory={vaultMultiplyHistory}
                      manageVault={generalManageVault.state}
                      header={GuniVaultHeader}
                      details={GuniManageMultiplyVaultDetails}
                      form={GuniManageMultiplyVaultForm}
                      history={VaultHistoryView}
                    />
                  </>
                ),
              }
              return (
                <Container variant="vaultPageContainer">
                  {multiplyContainerMap[vaultIlk] ? (
                    multiplyContainerMap[vaultIlk]
                  ) : (
                    <ManageMultiplyVaultContainer
                      vaultHistory={vaultMultiplyHistory}
                      manageVault={generalManageVault.state}
                      header={DefaultVaultHeader}
                      details={ManageMultiplyVaultDetails}
                      form={ManageMultiplyVaultForm}
                      history={VaultHistoryView}
                    />
                  )}
                </Container>
              )
          }
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
