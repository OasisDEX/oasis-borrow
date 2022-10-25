import { useAppContext } from 'components/AppContextProvider'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { AavePositionView } from 'features/aave/view/containers/AavePositionView'
import { earnContext, EarnContextProvider } from 'features/earn/EarnContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Grid } from 'theme-ui'

import { WithConnection } from '../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../components/Layouts'
import { AaveContextProvider } from '../../features/aave/AaveContextProvider'
import { AaveManagePositionView } from '../../features/aave/manage/containers/AaveManageView'
import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'
import { BackgroundLight } from '../../theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query.address || null,
    },
  }
}

function Position({ address }: { address: string }) {
  const { web3Context$ } = useAppContext()
  const [web3Context, web3ContextError] = useObservable(web3Context$)

  return (
    <AaveContextProvider>
      <EarnContextProvider>
        <DeferedContextProvider context={earnContext}>
          <WithConnection>
            <WithTermsOfService>
              <Grid gap={0} sx={{ width: '100%' }}>
                <BackgroundLight />
                <WithErrorHandler error={[web3ContextError]}>
                  <WithLoadingIndicator
                    value={[
                      web3Context,
                      ['connectedReadonly', 'connected'].includes(web3Context?.status || ''),
                    ]}
                    customLoader={<VaultContainerSpinner />}
                  >
                    {([_web3Context, _]) =>
                      _web3Context.status === 'connectedReadonly' ? (
                        <AavePositionView address={address} />
                      ) : (
                        <AaveManagePositionView address={address} />
                      )
                    }
                  </WithLoadingIndicator>
                </WithErrorHandler>
              </Grid>
            </WithTermsOfService>
          </WithConnection>
        </DeferedContextProvider>
      </EarnContextProvider>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
