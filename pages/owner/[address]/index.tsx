import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultOverviewView'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

function VaultsSummary({ address }: { address: string }) {
  const { t } = useTranslation()
  return address ? (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <PageSEOTags
            title="seo.title-single-token"
            titleParams={{
              product: t('seo.owner.title'),
              token: `${address.slice(0, 7)}...`,
            }}
            description="seo.multiply.description"
            url={`/owner/${address}`}
          />
          <VaultsOverviewView address={address} />
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

VaultsSummary.layout = AppLayout

export default VaultsSummary
