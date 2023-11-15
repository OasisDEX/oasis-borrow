import { WithConnection } from 'components/connectWallet'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultOverviewView'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { getLocalAppConfig } from 'helpers/config'
import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect } from 'react'

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
  const { NewPortfolio } = getLocalAppConfig('features')
  const { replace } = useRedirect()
  useEffect(() => {
    if (NewPortfolio) {
      void replace(getPortfolioLink(address))
    }
  }, [NewPortfolio, address, replace])
  return address ? (
    <AppLayout>
      <ProductContextHandler>
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
                url={getPortfolioLink(address)}
              />
              <VaultsOverviewView address={address} />
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </WithConnection>
      </ProductContextHandler>
    </AppLayout>
  ) : null
}

export default VaultsSummary
