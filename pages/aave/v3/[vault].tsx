import { getAddress } from 'ethers/lib/utils'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'
import { Grid } from 'theme-ui'

import { WithConnection } from '../../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../../components/Layouts'
import { AaveContextProvider, useAaveContext } from '../../../features/aave/AaveContextProvider'
import { ManageAaveStateMachineContextProvider } from '../../../features/aave/manage/containers/AaveManageStateMachineContext'
import { PositionId } from '../../../features/aave/types'
import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../../helpers/observableHook'
import { LendingProtocol } from '../../../lendingProtocols'
import { BackgroundLight } from '../../../theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      vault: ctx.query.vault || null,
    },
  }
}

function WithStrategy(positionId: PositionId) {
  const { strategyConfig$, aaveManageStateMachine, proxiesRelatedWithPosition$ } = useAaveContext(
    LendingProtocol.AaveV3,
  )
  const [strategyConfig, strategyConfigError] = useObservable(strategyConfig$(positionId))
  const [proxiesRelatedWithPosition, proxiesRelatedWithPositionError] = useObservable(
    proxiesRelatedWithPosition$(positionId),
  )
  return (
    <WithErrorHandler error={[strategyConfigError, proxiesRelatedWithPositionError]}>
      <WithLoadingIndicator
        value={[strategyConfig, proxiesRelatedWithPosition]}
        customLoader={<VaultContainerSpinner />}
      >
        {([_strategyConfig, _proxies]) => (
          <ManageAaveStateMachineContextProvider
            machine={aaveManageStateMachine}
            positionId={positionId}
            strategy={_strategyConfig}
          >
            <Grid gap={0} sx={{ width: '100%' }}>
              <BackgroundLight />
              <AaveManagePositionView
                address={_proxies.walletAddress}
                strategyConfig={_strategyConfig}
              />
            </Grid>
          </ManageAaveStateMachineContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function safeGetAddress(address: string | undefined) {
  if (address) {
    try {
      return getAddress(address)
    } catch (e) {
      return undefined
    }
  }
  return undefined
}

function Position({ vault }: { vault: string }) {
  const { replace } = useRouter()

  const address: string | undefined = safeGetAddress(vault)
  const vaultId: number | undefined =
    address !== undefined ? undefined : isNaN(Number(vault)) ? undefined : Number(vault)

  if (address === undefined && vaultId === undefined) {
    void replace('/')
  }

  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <WithStrategy walletAddress={address} vaultId={vaultId} />
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
