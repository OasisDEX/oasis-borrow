import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { ProductCardsLayout } from 'components/ProductCard'
import { ProductCardBorrow } from 'components/ProductCardBorrow'
import { ProductCardMultiply } from 'components/ProductCardMultiply'
import { TabSwitcher } from 'components/TabSwitcher'
import { WithArrow } from 'components/WithArrow'
import { AssetPageContent, assetsPageContentBySlug } from 'content/assets'
import { getAddress } from 'ethers/lib/utils'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { landingPageCardsData, ProductCardData } from 'helpers/productCards'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { useRouter } from 'next/router'

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

function TabContent(props: {
  type: 'borrow' | 'multiply' | 'earn'
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  ilks: string[]
}) {
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

  return (
    <WithErrorHandler error={[productCardsDataError]}>
      <WithLoadingIndicator
        value={[productCardsDataValue]}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {([productCardsData]) => (
          <>
            <ProductCardsLayout
              sx={{ width: '100%', mt: 3 }}
              productCards={props.ilks
                .map((ilk) => productCardsData.find((card) => card.ilk === ilk))
                .filter(
                  (cardData: ProductCardData | undefined): cardData is ProductCardData =>
                    cardData !== null,
                )
                .map((cardData) => props.renderProductCard({ cardData }))}
            />
          </>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function AssetView({ content }: { content: AssetPageContent }) {
  const { t } = useTranslation()

  return (
    <Grid sx={{ zIndex: 1, width: '100%' }}>
      <Flex sx={{ justifyContent: 'center', alignItems: 'baseline' }}>
        <Icon name={content.icon} size="44px" sx={{ mr: 2, alignSelf: 'center' }} />
        <Heading variant="header1">{content.header}</Heading>
        <Heading sx={{ ml: 2 }} variant="header3">
          ({content.symbol})
        </Heading>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 900 }}>
          <Text sx={{ display: 'inline', color: 'text.subtitle' }} variant="paragraph1">
            {t(content.descriptionKey)}
          </Text>
          <AppLink href={content.link}>
            <WithArrow sx={{ display: 'inline', color: 'link', ml: 2 }}>
              <Text sx={{ display: 'inline', color: 'link' }} variant="paragraph1">
                {t('learn-more')}
              </Text>
            </WithArrow>
          </AppLink>
        </Box>
      </Flex>
      <Grid sx={{ flex: 1, position: 'relative', mt: 5 }}>
        <TabSwitcher
          narrowTabsSx={{
            display: ['block', 'none'],
            maxWidth: '343px',
            width: '100%',
          }}
          wideTabsSx={{ display: ['none', 'block'], mb: 5 }}
          tabs={[
            {
              tabLabel: t('landing.tabs.multiply.tabLabel'),
              tabContent: (
                <TabContent
                  ilks={content.ilks}
                  type="multiply"
                  renderProductCard={ProductCardMultiply}
                />
              ),
            },
            {
              tabLabel: t('landing.tabs.borrow.tabLabel'),
              tabContent: (
                <TabContent
                  ilks={content.ilks}
                  type="borrow"
                  renderProductCard={ProductCardBorrow}
                />
              ),
            },
          ]}
        />
      </Grid>
    </Grid>
  )
}

export default function AssetPage({ asset }: { asset: string }) {
  const content: AssetPageContent | undefined = assetsPageContentBySlug[asset.toLocaleLowerCase()]
  const { replace } = useRouter()

  if (!content) {
    replace('/404')
    return null
  }

  return (
    <WithConnection>
      <WithTermsOfService>
        <AssetView content={content} />
        <BackgroundLight />
      </WithTermsOfService>
    </WithConnection>
  )
}

AssetPage.layout = AppLayout
