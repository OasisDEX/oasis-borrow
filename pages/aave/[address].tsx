import { getAddress } from 'ethers/lib/utils'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Grid } from 'theme-ui'

import { WithConnection } from '../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../components/Layouts'
import { AaveContextProvider, useAaveContext } from '../../features/aave/AaveContextProvider'
import { ManageAaveStateMachineContextProvider } from '../../features/aave/manage/containers/AaveManageStateMachineContext'
import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'
import { VaultContainerSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { BackgroundLight } from '../../theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      account: ctx.query.address || null,
    },
  }
}

function WithStrategy({ address }: { address: string }) {
  const { strategyConfig$, aaveManageStateMachine } = useAaveContext()
  const [strategyConfig, strategyConfigError] = useObservable(strategyConfig$(address))

  return (
    <WithErrorHandler error={[strategyConfigError]}>
      <WithLoadingIndicator value={[strategyConfig]} customLoader={<VaultContainerSpinner />}>
        {([_strategyConfig]) => (
          <ManageAaveStateMachineContextProvider
            machine={aaveManageStateMachine}
            address={address}
            strategy={_strategyConfig}
          >
            <Grid gap={0} sx={{ width: '100%' }}>
              <BackgroundLight />
              <AaveManagePositionView address={address} strategyConfig={_strategyConfig} />
            </Grid>
          </ManageAaveStateMachineContextProvider>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function Position({ account }: { account: string }) {
  const address = account ? getAddress(account) : ''

  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <WithStrategy address={address} />
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
