import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent, assetsPageContentBySlug } from 'content/assets'
import { getAddress } from 'ethers/lib/utils'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { Box, Flex, Grid, Heading, Text } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

function Summary({ address }: { address: string }) {
  const { vaultsOverview$, context$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const vaultsOverviewWithError = useObservableWithError(vaultsOverview$(checksumAddress))
  const contextWithError = useObservableWithError(context$)

  return (
    <WithErrorHandler error={[vaultsOverviewWithError.error, contextWithError.error]}>
      <WithLoadingIndicator value={[vaultsOverviewWithError.value, contextWithError.value]}>
        {([vaultsOverview, context]) => (
          <VaultsOverviewView
            vaultsOverview={vaultsOverview}
            context={context}
            address={checksumAddress}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      asset: ctx.query.asset || null,
    },
  }
}

function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  return (
    <Grid sx={{ zIndex: 1, width: '100%' }}>
      <Flex sx={{ justifyContent: 'center', alignItems: 'baseline' }}>
        <Icon name={content.icon} size="36px" sx={{ mr: 2 }} />
        <Heading variant="header1">{content.header}</Heading>
        <Heading sx={{ ml: 2 }} variant="header3">
          ({content.symbol})
        </Heading>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 900 }}>
          <Text sx={{ display: 'inline' }} variant="paragraph1">
            {t(content.descriptionKey)}
          </Text>
          <WithArrow sx={{ display: 'inline' }}>
            <Text sx={{ display: 'inline' }}>Learn more</Text>
          </WithArrow>
        </Box>
      </Flex>
    </Grid>
  )
}

export default function AssetPage({ asset }: { asset: string }) {
  const content: AssetPageContent | undefined = assetsPageContentBySlug[asset.toLocaleLowerCase()]

  return content ? (
    <WithConnection>
      <WithTermsOfService>
        <AssetView content={content} />
        <BackgroundLight />
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

AssetPage.layout = AppLayout
