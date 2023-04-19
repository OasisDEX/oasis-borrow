import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ProductCardBorrow } from 'components/productCards/ProductCardBorrow'
import { ProductCardEarnMaker } from 'components/productCards/ProductCardEarnMaker'
import { ProductCardMultiplyMaker } from 'components/productCards/ProductCardMultiplyMaker'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { TabBar } from 'components/TabBar'
import { VaultSuggestionsLoadingState } from 'features/vaultsOverview/components/VaultSuggestionsLoadingState'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAddress } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import {
  borrowPageCardsData,
  cardFiltersFromBalances,
  earnPageCardsData,
  landingPageCardsData,
  multiplyPageCardsData,
  ProductCardData,
  ProductLandingPagesFiltersKeys,
  ProductTypes,
} from 'helpers/productCards'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import uniqBy from 'lodash/uniqBy'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren } from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'
import { fadeInAnimation } from 'theme/animations'

export function VaultSuggestions({ address }: { address: string }) {
  const { t } = useTranslation()
  const { productCardsWithBalance$, accountData$ } = useAppContext()
  const { walletAddress } = useAccount()
  const productCardsWithBalanceObservable = useObservable(productCardsWithBalance$)
  const [accountData] = useObservable(accountData$)

  const isOwner = address === walletAddress

  return isOwner ? (
    <Box sx={{ mt: '112px' }}>
      <Heading as="h1" variant="header3" sx={{ textAlign: 'center', fontWeight: 'regular' }}>
        {t('vaults-overview.headers.vault-suggestions', {
          address: accountData?.ensName || formatAddress(address),
        })}
      </Heading>
      <TabBar
        variant="large"
        useDropdownOnMobile
        sections={[
          {
            label: t('landing.tabs.maker.multiply.tabLabel'),
            value: 'multiply',
            topContent: (
              <TabHeaderParagraph key="multiply">
                {t('landing.tabs.maker.multiply.tabParaContent')}{' '}
                <AppLink href="/multiply" variant="inText">
                  {t('landing.tabs.maker.multiply.tabParaLinkContent')}
                </AppLink>
              </TabHeaderParagraph>
            ),
            content: (
              <TabContent
                type="multiply"
                renderProductCard={ProductCardMultiplyMaker}
                productCardsWithBalanceObservable={productCardsWithBalanceObservable}
              />
            ),
          },
          {
            label: t('landing.tabs.maker.borrow.tabLabel'),
            value: 'borrow',
            topContent: (
              <TabHeaderParagraph key="borrow">
                <Text as="p">{t('landing.tabs.maker.borrow.tabParaContent')} </Text>
                <AppLink href="/borrow" variant="inText">
                  {t('landing.tabs.maker.borrow.tabParaLinkContent')}
                </AppLink>
              </TabHeaderParagraph>
            ),
            content: (
              <TabContent
                type="borrow"
                renderProductCard={ProductCardBorrow}
                productCardsWithBalanceObservable={productCardsWithBalanceObservable}
              />
            ),
          },
          {
            label: t('landing.tabs.maker.earn.tabLabel'),
            value: 'earn',
            topContent: (
              <TabHeaderParagraph key="earn">
                {t('landing.tabs.maker.earn.tabParaContent')}{' '}
                <AppLink href="/multiply" variant="inText">
                  {t('landing.tabs.maker.earn.tabParaLinkContent')}
                </AppLink>
              </TabHeaderParagraph>
            ),
            content: (
              <TabContent
                type="earn"
                renderProductCard={ProductCardEarnMaker}
                productCardsWithBalanceObservable={productCardsWithBalanceObservable}
              />
            ),
          },
        ]}
      />
    </Box>
  ) : null
}

function filterCards(props: {
  productCardsData: ProductCardData[]
  cardFilters: ProductLandingPagesFiltersKeys[]
  type: ProductTypes
}) {
  const productCardsDataByVaultType = {
    borrow: borrowPageCardsData,
    multiply: multiplyPageCardsData,
    earn: earnPageCardsData,
  }

  const filterCardsDataByProduct = productCardsDataByVaultType[props.type]
    ? productCardsDataByVaultType[props.type]
    : productCardsDataByVaultType['multiply']

  return uniqBy(
    props.cardFilters.reduce((cards, filter) => {
      if (filter) {
        return cards.concat(
          filterCardsDataByProduct({
            ilkToTokenMapping: props.productCardsData,
            cardsFilter: filter,
          }),
        )
      }
      return cards
    }, [] as ProductCardData[]),
    'ilk',
  )
}

function fallbackToFeaturedCards(props: {
  productCardsData: ProductCardData[]
  type: ProductTypes
}) {
  return landingPageCardsData({
    productCardsData: props.productCardsData,
    product: props.type,
  })
}

function TabHeaderParagraph({ children }: PropsWithChildren<{}>) {
  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center', mt: '24px', mb: 4 }}>
      <Text
        as="p"
        variant="paragraph2"
        sx={{
          maxWidth: '617px',
          textAlign: 'center',
          color: 'neutral80',
          ...fadeInAnimation,
        }}
      >
        {children}
      </Text>
    </Flex>
  )
}

function TabContent({
  type,
  renderProductCard,
  productCardsWithBalanceObservable,
}: {
  type: ProductTypes
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  productCardsWithBalanceObservable: [ProductCardData[] | undefined, any]
}) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')

  const [productCardsWithBalanceData, productCardsWithBalanceError] =
    productCardsWithBalanceObservable
  const ProductCard = renderProductCard

  return (
    <WithErrorHandler error={[productCardsWithBalanceError]}>
      <WithLoadingIndicator
        value={[productCardsWithBalanceData]}
        {...(followVaultsEnabled && { customLoader: <VaultSuggestionsLoadingState /> })}
      >
        {([productCardsData]) => {
          const balancedDerivedCardFilters = cardFiltersFromBalances(productCardsData)
          const filteredCards =
            balancedDerivedCardFilters.length > 0
              ? filterCards({
                  productCardsData,
                  cardFilters: balancedDerivedCardFilters,
                  type,
                })
              : fallbackToFeaturedCards({ productCardsData, type })

          return (
            <Box key={type} sx={{ mt: '48px' }}>
              {filteredCards.length > 0 ? (
                <ProductCardsWrapper>
                  {filteredCards.map((cardData) => (
                    <ProductCard cardData={cardData} key={cardData.ilk} />
                  ))}
                </ProductCardsWrapper>
              ) : (
                <>{followVaultsEnabled && <VaultSuggestionsLoadingState />}</>
              )}
            </Box>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
