import { AppLayout } from 'components/layouts/AppLayout'
import { GuniOpenVaultView } from 'features/earn/guni/open/containers/GuniOpenVaultView'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { supportedEarnIlks } from 'helpers/productCards'
import type { GetServerSidePropsContext, GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const getStaticPaths: GetStaticPaths<{ ilk: string }> = async () => {
  const paths = supportedEarnIlks.map((ilk) => ({ params: { ilk } })) // these paths will be generated at built time
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
    <AppLayout>
      <WithTermsOfService>
        <GuniOpenVaultView ilk={ilk} />
        <Survey for="earn" />
      </WithTermsOfService>
    </AppLayout>
  )
}

export default OpenVault
