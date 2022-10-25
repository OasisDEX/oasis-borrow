import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { earnContext, EarnContextProvider } from 'features/earn/EarnContextProvider'
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
  return (
    <AaveContextProvider>
      <EarnContextProvider>
        <DeferedContextProvider context={earnContext}>
          <WithConnection>
            <WithTermsOfService>
              <Grid gap={0} sx={{ width: '100%' }}>
                <BackgroundLight />
                <AaveManagePositionView address={address} />
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
