import React from 'react'
import { ethereumMainnetHexId } from 'blockchain/networks'
import { WithWalletConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts'
import { useAccount } from 'helpers/useAccount'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      walletAddress: ctx.query.wallet || null,
    },
  }
}

function DsrProxyPage({ walletAddress }: { walletAddress: string }) {
  const { walletAddress: walletContextAddress } = useAccount()
  const { replace } = useRouter()

  if (!walletAddress && walletContextAddress) {
    void replace(`/earn/dsr/${walletContextAddress}`)
  }

  return (
    <WithWalletConnection chainId={ethereumMainnetHexId} includeTestNet>
      {null}
    </WithWalletConnection>
  )
}

DsrProxyPage.layout = AppLayout

export default DsrProxyPage
