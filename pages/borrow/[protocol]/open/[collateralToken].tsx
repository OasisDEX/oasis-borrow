import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { AppLayout } from 'components/Layouts'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { aaveContext, AaveContextProvider } from '../../../../features/aave/AaveContextProvider'
import { loadStrategyFromUrl } from '../../../../features/aave/strategyConfig'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const collateralToken = ctx.query.collateralToken as string
  try {
    loadStrategyFromUrl(collateralToken, 'Borrow')
  } catch (e) {
    console.log(`could not load strategy '${collateralToken}' for route '${ctx.resolvedUrl}'`)
    return {
      notFound: true,
    }
  }
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      strategy: collateralToken,
    },
  }
}

function OpenVault({ strategy }: { strategy: string }) {
  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <BackgroundLight />
          <DeferedContextProvider context={aaveContext}>
            <AaveOpenView config={loadStrategyFromUrl(strategy, 'Borrow')} />
          </DeferedContextProvider>
          <Survey for="earn" />
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
