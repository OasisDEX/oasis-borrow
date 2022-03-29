import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { supportedBorrowIlks } from '../../../helpers/productCards'

export const getStaticPaths: GetStaticPaths<{ ilk: string }> = async () => {
  const paths = supportedBorrowIlks.map((ilk) => ({ params: { ilk } })) // these paths will be generated at built time
  return {
    paths,
    fallback: true,
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

function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <OpenVaultView ilk={ilk} />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
