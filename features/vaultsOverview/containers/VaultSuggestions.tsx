import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { TabBar } from 'components/TabBar'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import uniqBy from 'lodash/uniqBy'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'

import { AppLink } from '../../../components/Links'
import { ProductCardBorrow } from '../../../components/productCards/ProductCardBorrow'
import { ProductCardEarnMaker } from '../../../components/productCards/ProductCardEarnMaker'
import { ProductCardMultiplyMaker } from '../../../components/productCards/ProductCardMultiplyMaker'
import { ProductCardsWrapper } from '../../../components/productCards/ProductCardsWrapper'
import { formatAddress } from '../../../helpers/formatters/format'
import {
  borrowPageCardsData,
  cardFiltersFromBalances,
  earnPageCardsData,
  landingPageCardsData,
  multiplyPageCardsData,
  ProductCardData,
  ProductLandingPagesFiltersKeys,
  ProductTypes,
} from '../../../helpers/productCards'
import { WithChildren } from '../../../helpers/types'
import { fadeInAnimation, slideInAnimation } from '../../../theme/animations'

interface Props {
  address: string
}

export function VaultSuggestions({ address }: Props) {
  const { productCardsWithBalance$, context$, accountData$ } = useAppContext()
  const [context, contextError] = useObservable(context$)
  const [productCardsDataValue, productCardsDataError] = useObservable(productCardsWithBalance$)
  const [accountData] = useObservable(accountData$)

  return (
    <WithErrorHandler error={[contextError, productCardsDataError]}>
      <WithLoadingIndicator value={[context, productCardsDataValue]}>
        {([_context, _productCardsDataValue]) => (
          <VaultSuggestionsView
            address={accountData?.ensName || address}
            context={_context}
            productCardsData={_productCardsDataValue}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

interface ViewProps {
  productCardsData: ProductCardData[]
  context: Context
  address: string
}

function VaultSuggestionsView({ productCardsData, context, address }: ViewProps) {
  const { t } = useTranslation()

  const connectedAccount = context?.status === 'connected' ? context.account : undefined
  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  if (!isOwnerViewing) return null

  return (
    <Box mt={5}>
      <Heading variant="header2" sx={{ textAlign: 'center', fontWeight: 'regular' }} as="h1">
        <Trans
          i18nKey="vaults-overview.headers.vault-suggestions"
          values={{ address: formatAddress(address) }}
          components={[<br />]}
        />
      </Heading>
      <TabBar
        variant="large"
        useDropdownOnMobile
        sections={[
          {
            label: t('landing.tabs.maker.multiply.tabLabel'),
            value: 'multiply',
            topContent: (
              <TabHeaderParagraph>
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
                productCardsData={productCardsData}
              />
            ),
          },
          {
            label: t('landing.tabs.maker.borrow.tabLabel'),
            value: 'borrow',
            topContent: (
              <TabHeaderParagraph>
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
                productCardsData={productCardsData}
              />
            ),
          },
          {
            label: t('landing.tabs.maker.earn.tabLabel'),
            value: 'earn',
            topContent: (
              <TabHeaderParagraph>
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
                productCardsData={productCardsData}
              />
            ),
          },
        ]}
      />
    </Box>
  )
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

function TabContent(props: {
  type: ProductTypes
  renderProductCard: (props: { cardData: ProductCardData }) => JSX.Element
  productCardsData: ProductCardData[]
}) {
  const { productCardsData } = props
  const ProductCard = props.renderProductCard

  const balancedDerivedCardFilters = cardFiltersFromBalances(productCardsData)

  const hasFilters = balancedDerivedCardFilters.length > 0
  const filteredCards = hasFilters
    ? filterCards({ productCardsData, cardFilters: balancedDerivedCardFilters, type: props.type })
    : fallbackToFeaturedCards({ productCardsData, type: props.type })

  return (
    <Flex
      key={props.type}
      sx={{ flexDirection: 'column', mt: 5, alignItems: 'center', width: '100%' }}
    >
      <ProductCardsWrapper>
        {filteredCards.map((cardData) => (
          <ProductCard cardData={cardData} key={cardData.ilk} />
        ))}
      </ProductCardsWrapper>
    </Flex>
  )
}

function TabHeaderParagraph({ children }: WithChildren) {
  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center', my: 3 }}>
      <Box
        sx={{
          ...slideInAnimation,
        }}
      >
        <Text
          variant="paragraph2"
          sx={{
            color: 'neutral80',
            maxWidth: 617,
            textAlign: 'center',
            mb: 4,
            ...fadeInAnimation,
          }}
        >
          {children}
        </Text>
      </Box>
    </Flex>
  )
}
