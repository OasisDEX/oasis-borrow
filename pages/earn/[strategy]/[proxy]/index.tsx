import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Grid } from 'theme-ui'

import { WithConnection } from '../../../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../../../components/Layouts'
import { AaveContextProvider } from '../../../../features/earn/aave/AaveContextProvider'
import { AaveManagePositionView } from '../../../../features/earn/aave/manage/containers/AaveManageView'
import { WithTermsOfService } from '../../../../features/termsOfService/TermsOfService'
import { BackgroundLight } from '../../../../theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      strategy: ctx.query.strategy || null,
      proxy: ctx.query.proxy || null,
    },
  }
}

function Position({ proxy }: { proxy: string; strategy: string }) {
  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <Grid gap={0} sx={{ width: '100%' }}>
            <BackgroundLight />
            <AaveManagePositionView proxy={proxy} />
          </Grid>
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

Position.layout = AppLayout

export default Position
