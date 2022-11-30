import { useInterpret } from '@xstate/react'
import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Container, Grid } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

import { TabBar } from '../../components/TabBar'
import { AaveContextProvider, useAaveContext } from '../../features/aave/AaveContextProvider'
import { CreateDPMAccountView } from '../../features/stateMachines/dpmAccount/CreateDPMAccountView'
import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function DPMContainer() {
  const { dpmAccountStateMachine } = useAaveContext()
  const { t } = useTranslation()
  const service = useInterpret(dpmAccountStateMachine, { devTools: true }).start()
  return (
    <Container variant="vaultPageContainer">
      <TabBar
        variant="underline"
        sections={[
          {
            value: 'simulate',
            label: t('open-vault.simulate'),
            content: (
              <Grid variant="vaultContainer">
                <Box></Box>
                <Box>
                  <CreateDPMAccountView machine={service} />
                </Box>
              </Grid>
            ),
          },
        ]}
      />
    </Container>
  )
}

function DPM() {
  return (
    <AaveContextProvider>
      <WithWalletConnection>
        <WithTermsOfService>
          <BackgroundLight />
          <DPMContainer />
        </WithTermsOfService>
      </WithWalletConnection>
    </AaveContextProvider>
  )
}

DPM.layout = AppLayout

export default DPM
