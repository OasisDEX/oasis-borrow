import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { AppLayout } from 'components/Layouts'
import { aaveContext, AaveContextProvider } from 'features/aave/AaveContextProvider'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import { loadStrategyFromUrl } from 'features/aave/strategyConfig'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const strategy = ctx.query.strategy as string
  const protocol = ctx.query.protocol as string
  const version = ctx.query.version as string
  const lendingProtocol = `${protocol}${version}`
  try {
    console.log(`loading strategy '${strategy}' for route '${ctx.resolvedUrl}'`)
    loadStrategyFromUrl(strategy, lendingProtocol, 'earn')
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
      protocol: lendingProtocol,
    },
  }
}

function OpenVault({ strategy, protocol }: { strategy: string; protocol: string }) {
  return (
    <AaveContextProvider>
      <WithConnection>
        <WithTermsOfService>
          <BackgroundLight />
          <DeferedContextProvider context={aaveContext}>
            <AaveOpenView config={loadStrategyFromUrl(strategy, protocol, 'earn')} />
          </DeferedContextProvider>
          <Survey for="earn" />
        </WithTermsOfService>
      </WithConnection>
    </AaveContextProvider>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
