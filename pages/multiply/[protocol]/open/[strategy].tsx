import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { AaveContextProvider } from '../../../../features/aave/AaveContextProvider'
import { AaveMultiplyHeader } from '../../../../features/multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from '../../../../features/multiply/aave/components/AaveMultiplyManageComponent'
import { AaveMultiplySimulate } from '../../../../features/multiply/aave/components/AaveMultiplySimulate'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      strategy: ctx.query.strategy || null,
    },
  }
}

function OpenVault({ strategy: _strategy }: { strategy: string }) {
  return (
    <AaveContextProvider>
      <WithWalletConnection>
        <WithTermsOfService>
          <BackgroundLight />

          <AaveOpenView
            config={{
              name: 'stETHusdc',
              urlSlug: 'stETHusdc',
              viewComponents: {
                headerOpen: AaveMultiplyHeader,
                headerManage: AaveMultiplyHeader,
                simulateSection: AaveMultiplySimulate,
                vaultDetails: AaveMultiplyManageComponent,
              },
            }}
          />

          <Survey for="earn" />
        </WithTermsOfService>
      </WithWalletConnection>
    </AaveContextProvider>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
