import { WithWalletConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { OpenMultiplyVaultView } from 'features/multiply/open/containers/OpenMultiplyVaultView'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { supportedMultiplyIlks } from 'helpers/productCards'
import { LendingProtocolLongName } from 'lendingProtocols'
import { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticPaths: GetStaticPaths<{ ilk: string }> = async () => {
  const paths = supportedMultiplyIlks.map((ilk) => ({ params: { ilk } })) // these paths will be generated at built time
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
              product: t('seo.multiply.title'),
              protocol: LendingProtocolLongName.Maker,
              token1: ilk,
              token2: 'DAI',
            }}
            description="seo.multiply.description"
            url="/multiply"
          />
          <OpenMultiplyVaultView ilk={ilk} />
          <Survey for="multiply" />
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout

export default OpenVault
