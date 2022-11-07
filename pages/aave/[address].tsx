import { useAppContext } from 'components/AppContextProvider'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { AaveManagePositionView } from 'features/aave/manage/containers/AaveManageView'
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
  const { web3Context$, connectedContext$, proxyAddress$ } = useAppContext()
  const [web3Context, web3ContextError] = useObservable(web3Context$)
  const [connectedContext, connectedContextError] = useObservable(connectedContext$)
  const [proxyAddress, proxyAddressError] = useObservable(proxyAddress$(address))

  return (
    <AaveContextProvider>
      <EarnContextProvider>
        <DeferedContextProvider context={earnContext}>
          <WithConnection>
            <WithTermsOfService>
              <Grid gap={0} sx={{ width: '100%' }}>
                <BackgroundLight />
                <WithErrorHandler
                  error={[web3ContextError, connectedContextError, proxyAddressError]}
                >
                  <WithLoadingIndicator
                    value={[
                      web3Context,
                      ['connectedReadonly', 'connected'].includes(web3Context?.status || ''),
                      proxyAddress,
                    ]}
                    customLoader={<VaultContainerSpinner />}
                  >
                    {([_web3Context, _, _proxyAddress]) => {
                      if (
                        _web3Context.status === 'connected' &&
                        connectedContext?.account === address
                      ) {
                        return <AaveManagePositionView address={address} />
                      }
                      if (['connectedReadonly', 'connected'].includes(_web3Context.status)) {
                        return <AavePositionView address={address} proxyAddress={proxyAddress} />
                      }
                      // theoretically should never happen (unless web3Context fails)
                      return <div />
                    }}
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
