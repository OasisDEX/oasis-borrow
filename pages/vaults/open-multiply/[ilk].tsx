import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { GuniOpenVaultView } from 'features/earn/guni/open/containers/GuniOpenVaultView'
import { OpenMultiplyVaultView } from 'features/multiply/open/containers/OpenMultiplyVaultView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export const getStaticPaths: GetStaticPaths<{ ilk: string }> = async () => {
  return {
    paths: [
      { params: { ilk: 'ETH-B' } },
      { params: { ilk: 'ETH-A' } },
      { params: { ilk: 'ETH-C' } },
    ], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  }
}

export async function getStaticProps(ctx: GetServerSidePropsContext & { params: { ilk: string } }) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      ilk: ctx.params.ilk || null,
    },
  }
}

const multiplyContainerMap: Record<string, (ilk: string) => JSX.Element> = {
  'GUNIV3DAIUSDC1-A': (ilk) => <GuniOpenVaultView ilk={ilk} />,
  'GUNIV3DAIUSDC2-A': (ilk) => <GuniOpenVaultView ilk={ilk} />,
}
export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        {multiplyContainerMap[ilk] ? (
          multiplyContainerMap[ilk](ilk)
        ) : (
          <OpenMultiplyVaultView ilk={ilk} />
        )}
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
