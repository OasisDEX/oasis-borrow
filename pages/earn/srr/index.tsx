import { useAccount } from 'helpers/useAccount'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SkyStakeUsdsViewWrapper from 'pages/earn/srr/[wallet]'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      walletAddress: ctx.query.wallet || null,
    },
  }
}

function SkyProxyPage({ walletAddress }: { walletAddress: string }) {
  const { walletAddress: walletContextAddress } = useAccount()
  const { replace } = useRouter()
  if (!walletAddress && walletContextAddress) {
    void replace(`/earn/srr/${walletContextAddress}`)
  }

  return <SkyStakeUsdsViewWrapper />
}

export default SkyProxyPage
