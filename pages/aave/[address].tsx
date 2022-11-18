import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
import { earnContext, EarnContextProvider } from 'features/earn/EarnContextProvider'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Grid } from 'theme-ui'

import { WithConnection } from '../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../components/Layouts'
import { AaveContextProvider, useAaveContext } from '../../features/aave/AaveContextProvider'
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
  const { strategyConfig$ } = useAaveContext()
  const [strategyConfig, strategyConfigError] = useObservable(strategyConfig$(address))

  return (
    <WithErrorHandler error={[strategyConfigError]}>
      <WithLoadingIndicator value={[strategyConfig]} customLoader={<VaultContainerSpinner />}>
        {([_strategyConfig]) => {
          return (
            <Grid gap={0} sx={{ width: '100%' }}>
              <BackgroundLight />
              <AaveManagePositionView address={address} strategyConfig={_strategyConfig} />
            </Grid>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function Position({ account }: { account: string }) {
  const address = account ? getAddress(account) : ''

  return (
    <AaveContextProvider>
      <EarnContextProvider>
        <DeferedContextProvider context={earnContext}>
          <WithConnection>
            <WithTermsOfService>
              <WithStrategy address={address} />
            </WithTermsOfService>
          </WithConnection>
        </DeferedContextProvider>
      </EarnContextProvider>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
