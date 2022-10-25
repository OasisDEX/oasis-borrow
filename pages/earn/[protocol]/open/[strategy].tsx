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
import { ManageSectionComponent } from '../../../../features/aave/manage/components'
import { SimulateSectionComponent } from '../../../../features/aave/open/components'
import {
  AavePositionHeader,
  AavePositionHeaderWithDetails,
} from '../../../../features/earn/aave/components/AavePositionHeader'

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
              urlSlug: 'stETHeth',
              name: 'stETHeth',
              viewComponents: {
                headerOpen: AavePositionHeaderWithDetails,
                headerManage: AavePositionHeader,
                simulateSection: SimulateSectionComponent,
                vaultDetails: ManageSectionComponent,
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
