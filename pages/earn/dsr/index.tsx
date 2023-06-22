import { ethereumMainnetHexId } from 'blockchain/networks'
import { WithWalletConnection } from 'components/connectWallet'
import { AppLayout } from 'components/Layouts'
import { useAccount } from 'helpers/useAccount'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React from 'react'

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

  return <WithWalletConnection chainId={ethereumMainnetHexId}>{null}</WithWalletConnection>
}

DsrProxyPage.layout = AppLayout

export default DsrProxyPage
