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
import { loadStrategyFromSlug } from '../../../../features/aave/strategyConfig'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const strategy = ctx.query.strategy as string
  try {
    loadStrategyFromSlug(strategy)
  } catch (e) {
    console.log(`could not load strategy '${strategy}' for route '${ctx.resolvedUrl}'`)
    return {
      notFound: true,
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      strategy: strategy,
    },
  }
}

function OpenVault({ strategy }: { strategy: string }) {
  return (
    <AaveContextProvider>
      <WithWalletConnection>
        <WithTermsOfService>
          <BackgroundLight />

          <AaveOpenView config={loadStrategyFromSlug(strategy)} />

          <Survey for="earn" />
        </WithTermsOfService>
      </WithWalletConnection>
    </AaveContextProvider>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
