import { ethereumMainnetHexId } from 'blockchain/networks'
import { WithWalletConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts/AppLayout'
import { useAccount } from 'helpers/useAccount'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
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

  return (
    <AppLayout>
      <WithWalletConnection chainId={ethereumMainnetHexId} includeTestNet={true}>
        {null}
      </WithWalletConnection>
    </AppLayout>
  )
}

export default SkyProxyPage
