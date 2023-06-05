import { WithWalletConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/borrow/open/containers/OpenVaultView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { supportedBorrowIlks } from 'helpers/productCards'
import { LendingProtocolLabel } from 'lendingProtocols'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

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
  const { t } = useTranslation()
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <PageSEOTags
            title="seo.title-product-w-tokens"
            titleParams={{
              product: t('seo.borrow.title'),
              protocol: LendingProtocolLabel.maker,
              token1: ilk,
              token2: 'DAI',
            }}
            description="seo.borrow.description"
            url="/borrow"
          />
          <OpenVaultView ilk={ilk} />
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
