import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithWalletConnection } from '../../../components/connectWallet/ConnectWallet'
import { AppLayout } from '../../../components/Layouts'
import { AaveContextProvider } from '../../../features/aave/AaveContextProvider'
import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'
import { ContainerDPM } from './components/containerDPM'
import { DpmContextProvider } from './components/dpmProvider'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

function DpmPage() {
  return (
    <AaveContextProvider>
      <WithWalletConnection>
        <WithTermsOfService>
          <DpmContextProvider>
            <BackgroundLight />
            <ContainerDPM />
          </DpmContextProvider>
        </WithTermsOfService>
      </WithWalletConnection>
    </AaveContextProvider>
  )
}
DpmPage.layout = AppLayout

export default DpmPage
