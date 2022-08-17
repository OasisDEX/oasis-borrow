import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultOverviewView'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithWalletAssociatedRisk } from '../../../features/walletAssociatedRisk/WalletAssociatedRisk'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

function VaultsSummary({ address }: { address: string }) {
  return address ? (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <VaultsOverviewView address={address} />
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

VaultsSummary.layout = AppLayout

export default VaultsSummary
