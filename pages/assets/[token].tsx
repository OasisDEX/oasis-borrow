import { MarketingLayout } from 'components/Layouts'
import { AssetView } from 'features/assets/AssetView'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export default function AssetPage({ token }: { token: string }) {
  return (
    <>
      <BackgroundLight />
      <AssetView token={token} />
    </>
  )
}

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      token: ctx.query.token || null,
    },
  }
}

AssetPage.layout = MarketingLayout
